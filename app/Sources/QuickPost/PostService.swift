import Foundation

// Foundation-only on purpose: this file (plus a scratch main) compiles standalone
// with swiftc for smoke-testing the templates and git flow without the GUI.

enum PostKind: String, CaseIterable, Identifiable, Sendable {
    case note = "Note"
    case reply = "Reply"
    var id: String { rawValue }
}

struct PostDraft: Sendable {
    let kind: PostKind
    let body: String
    let slug: String
    let replyURL: String
}

struct PostError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

enum PostService {
    // Overrides: `defaults write me.michaelbishop.quickpost repoPath -string /path`
    // and `defaults write me.michaelbishop.quickpost skipPush -bool YES`.
    // Env vars take precedence so a CLI harness can drive publishSync directly.
    static var repoPath: String {
        ProcessInfo.processInfo.environment["QUICKPOST_REPO"]
            ?? UserDefaults.standard.string(forKey: "repoPath")
            ?? "/Users/miklb/Sites/michaelbishop"
    }

    static var skipPush: Bool {
        ProcessInfo.processInfo.environment["QUICKPOST_SKIP_PUSH"] != nil
            || UserDefaults.standard.bool(forKey: "skipPush")
    }

    static func publish(_ draft: PostDraft) async throws -> String {
        try await Task.detached(priority: .userInitiated) {
            try publishSync(draft)
        }.value
    }

    static func publishSync(_ draft: PostDraft) throws -> String {
        let repo = URL(fileURLWithPath: repoPath, isDirectory: true)
        let now = Date()

        let slug: String
        if draft.kind == .note, !draft.slug.isEmpty {
            let s = slugify(draft.slug)
            guard !s.isEmpty else { throw PostError(message: "Slug reduces to nothing.") }
            slug = s
        } else {
            let prefix = draft.kind == .note ? "note" : "reply"
            slug = "\(prefix)-\(stampFormatter.string(from: now))"
        }

        let dir = draft.kind == .note ? "content/notes" : "content/replies"
        let relPath = "\(dir)/\(slug).md"
        let fileURL = repo.appendingPathComponent(relPath)

        guard !FileManager.default.fileExists(atPath: fileURL.path) else {
            throw PostError(message: "Already exists: \(relPath)")
        }

        let contents = fileContents(for: draft, date: dateFormatter.string(from: now))
        try contents.write(to: fileURL, atomically: true, encoding: .utf8)

        let commitPrefix = draft.kind == .note ? "Note" : "Reply"
        try git(["add", "--", relPath], in: repo)
        try git(["commit", "-m", "\(commitPrefix): \(slug)"], in: repo)

        if skipPush {
            return "\(slug) (push skipped)"
        }

        // The syndicate workflow commits captured URLs back to main with
        // [skip ci], so this clone is routinely behind origin. Autostash
        // because the working tree may have unrelated dirty files.
        do {
            try git(["pull", "--rebase", "--autostash", "origin", "main"], in: repo)
        } catch {
            _ = try? git(["rebase", "--abort"], in: repo)
            throw PostError(message: "Rebase onto origin/main failed — \(slug) is committed locally; resolve in a terminal and push.\n\(error.localizedDescription)")
        }

        do {
            try git(["push", "origin", "main"], in: repo)
        } catch {
            throw PostError(message: "Push failed — \(slug) is committed locally. If this is an SSH auth error, run `ssh-add --apple-use-keychain` and try again.\n\(error.localizedDescription)")
        }

        return slug
    }

    // Matches scripts/new-note.js slugify exactly.
    static func slugify(_ input: String) -> String {
        input.lowercased()
            .replacingOccurrences(of: "'", with: "")
            .replacingOccurrences(of: "\u{2019}", with: "")
            .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
            .replacingOccurrences(of: "^-+|-+$", with: "", options: .regularExpression)
    }

    static func fileContents(for draft: PostDraft, date: String) -> String {
        switch draft.kind {
        case .note:
            return """
            ---
            date: \(date)
            tags:
              - note
            ---

            \(draft.body)

            <a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
            <a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>

            """
        case .reply:
            // No u-bridgy-fed: replies are never federated (see article.njk).
            return """
            ---
            date: \(date)
            in-reply-to: '\(draft.replyURL)'
            ---

            \(draft.body)

            <a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>

            """
        }
    }

    // Local time with colon offset, e.g. 2026-09-02T14:05:00-04:00. Dates must
    // be explicit in frontmatter — Workers Builds' shallow clones break
    // 11ty's "git Created".
    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
        return f
    }()

    private static let stampFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd-HHmm"
        return f
    }()

    @discardableResult
    private static func git(_ args: [String], in repo: URL) throws -> String {
        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: "/usr/bin/git")
        proc.arguments = args
        proc.currentDirectoryURL = repo
        let out = Pipe()
        let err = Pipe()
        proc.standardOutput = out
        proc.standardError = err
        try proc.run()
        let stdoutData = out.fileHandleForReading.readDataToEndOfFile()
        let stderrData = err.fileHandleForReading.readDataToEndOfFile()
        proc.waitUntilExit()
        let stdout = String(data: stdoutData, encoding: .utf8) ?? ""
        guard proc.terminationStatus == 0 else {
            let stderr = String(data: stderrData, encoding: .utf8) ?? ""
            let detail = [stderr, stdout]
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { !$0.isEmpty }
                .joined(separator: "\n")
            throw PostError(message: "git \(args.first ?? "") failed:\n\(detail)")
        }
        return stdout
    }
}
