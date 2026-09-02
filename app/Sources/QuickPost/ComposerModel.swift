import AppKit
import SwiftUI

enum PostState: Equatable {
    case idle
    case posting
    case success(String)
    case failure(String)
}

@MainActor
final class ComposerModel: ObservableObject {
    @Published var kind: PostKind = .note
    @Published var text = ""
    @Published var slug = ""
    @Published var replyURL = ""
    @Published var state: PostState = .idle

    private var windowObserver: NSObjectProtocol?

    init() {
        // MenuBarExtra window content only gets onAppear once; becoming key
        // fires every time the popover opens, so the clipboard check runs then.
        windowObserver = NotificationCenter.default.addObserver(
            forName: NSWindow.didBecomeKeyNotification, object: nil, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.prefillFromClipboard() }
        }
    }

    var canPost: Bool {
        guard state != .posting else { return false }
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return false }
        if kind == .reply {
            let raw = replyURL.trimmingCharacters(in: .whitespaces)
            guard let url = URL(string: raw), url.scheme == "https", url.host != nil else { return false }
        }
        return true
    }

    func prefillFromClipboard() {
        guard replyURL.isEmpty, state == .idle,
              let clip = NSPasteboard.general.string(forType: .string)?
                  .trimmingCharacters(in: .whitespacesAndNewlines)
        else { return }
        let pattern = #"^https://bsky\.app/profile/[^/\s]+/post/\S+$"#
        if clip.range(of: pattern, options: .regularExpression) != nil {
            kind = .reply
            replyURL = clip
        }
    }

    func post() {
        guard canPost else { return }
        state = .posting
        let draft = PostDraft(
            kind: kind,
            body: text.trimmingCharacters(in: .whitespacesAndNewlines),
            slug: slug.trimmingCharacters(in: .whitespaces),
            replyURL: replyURL.trimmingCharacters(in: .whitespaces)
        )
        Task {
            do {
                let slug = try await PostService.publish(draft)
                text = ""
                self.slug = ""
                replyURL = ""
                kind = .note
                state = .success(slug)
                try? await Task.sleep(nanoseconds: 2_500_000_000)
                if case .success = state { state = .idle }
            } catch {
                state = .failure(error.localizedDescription)
            }
        }
    }
}
