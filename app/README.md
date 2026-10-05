# QuickPost

A tiny native macOS menu bar app for posting [notes](https://michaelbishop.me/notes/)
and replies to this site without touching a terminal.

This site publishes by pushing markdown to `main` — Cloudflare Workers Builds
deploys it, and a GitHub Action syndicates to Bluesky/the fediverse via
[Bridgy](https://brid.gy). That means "an app that posts to my site" needs no
server, no Micropub endpoint, and no auth beyond the git credentials already on
the machine. QuickPost is the whole idea taken literally: a compose box that
writes a markdown file into the repo, commits it, and pushes.

## What it does

Click the menu bar icon (a square-and-pencil) to get a small compose popover:

- **Note | Reply** toggle. Notes get an optional slug (timestamped filename
  otherwise); replies get an `in-reply-to` URL field.
- **Clipboard assist**: if the clipboard holds a `bsky.app` post URL when the
  popover opens, it switches to Reply and prefills the URL — the intended flow
  is "see a post while skimming Bluesky, copy its link, reply from your own
  site."
- **⌘↩ to post.** On post it writes the file with the same frontmatter the
  `npm run note` scaffolder produces (explicit local-offset `date:`, Bridgy
  syndication links), then:
  1. **Refuses to do anything unless the repo is on `main`** — see below
  2. `git add` — only the new file
  3. `git commit -m "Note: <slug>"`
  4. `git pull --rebase --autostash origin main` — the syndication workflow
     commits captured URLs back to `main` with `[skip ci]`, so the local clone
     is routinely behind; autostash tolerates an otherwise-dirty tree
  5. `git push origin HEAD:main`
  6. Verifies `origin/main` actually moved to the new commit
- Errors show inline with the draft intact; drafts survive clicking away.

From there the normal pipeline takes over: Workers Builds deploys, the
syndicate Action waits for the deploy, pings Bridgy, and commits the resulting
Bluesky/fediverse URLs back into the post's frontmatter. Post-to-live is about
a minute.

## Building

Swift 5.9+ with macOS Command Line Tools is enough — no Xcode required
(the CLT SDK includes SwiftUI). Requires macOS 14+.

```bash
./build.sh          # swift build -c release + assemble build/QuickPost.app
open build/QuickPost.app
```

The bundle is ad-hoc signed and unsandboxed (it needs plain file + git access
to the repo working copy).

To keep it handy, symlink it into /Applications and add it to
System Settings → Login Items:

```bash
ln -s "$PWD/build/QuickPost.app" /Applications/QuickPost.app
```

A symlink (rather than a copy) means a rebuild is picked up automatically.

## Configuration

Settings live in `defaults` under `me.michaelbishop.quickpost`:

```bash
# repo working copy (default: /Users/miklb/Sites/michaelbishop)
defaults write me.michaelbishop.quickpost repoPath -string /path/to/clone

# commit but don't push — useful for testing
defaults write me.michaelbishop.quickpost skipPush -bool YES
```

`QUICKPOST_REPO` and `QUICKPOST_SKIP_PUSH` environment variables override
those; `PostService.swift` is Foundation-only on purpose so it can be compiled
standalone with `swiftc` next to a scratch `main.swift` for smoke-testing the
templates and git flow without the GUI.

## Troubleshooting

- **Push fails with `Permission denied (publickey)`** — GUI apps get the SSH
  agent from launchd, which occasionally lacks the key. Run
  `ssh-add --apple-use-keychain` (or set `UseKeychain yes` /
  `AddKeysToAgent yes` in `~/.ssh/config`). The post stays committed locally;
  pushing from a terminal also recovers it.
- **Rebase failure** — the app aborts the rebase and reports it; the post is
  committed locally, resolve in a terminal and push.
- **"Repo is on branch 'x', not main"** — publishing is main-only. The commit
  would go to whichever branch is checked out while the push sends `main`, so
  on a feature branch the post lands nowhere and git still exits 0. The app
  now checks first and writes nothing. `git checkout main` in the repo and
  post again.

  This is the bug that produced a **green success with nothing published**
  (2026-10-05): a note committed onto a checked-out feature branch, then
  `git push origin main` pushed the local `main` ref, which had no new
  commits, so git reported "Everything up-to-date" and exited 0. Hence both
  the branch guard and the post-push check that `origin/main` really moved —
  a push with nothing to send also exits 0, so the exit code alone cannot
  tell "published" from "did nothing".

## Adapting it

The site-specific parts are all in `Sources/QuickPost/PostService.swift`: the
default repo path, the frontmatter templates (which match this site's
`scripts/new-note.js` and its Bridgy conventions), and the branch name. If your
site also publishes by pushing markdown, that file is the only thing to change.
