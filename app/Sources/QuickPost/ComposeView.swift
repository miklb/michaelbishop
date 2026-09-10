import SwiftUI

struct ComposeView: View {
    @ObservedObject var model: ComposerModel

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Picker("Type", selection: $model.kind) {
                ForEach(PostKind.allCases) { kind in
                    Text(kind.rawValue).tag(kind)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()

            if model.kind == .reply {
                TextField("bsky.app post URL", text: $model.replyURL)
                    .textFieldStyle(.roundedBorder)
            } else {
                TextField("slug (optional)", text: $model.slug)
                    .textFieldStyle(.roundedBorder)
            }

            TextEditor(text: $model.text)
                .font(.body)
                .scrollContentBackground(.hidden)
                .padding(6)
                .background(Color(nsColor: .textBackgroundColor))
                .clipShape(RoundedRectangle(cornerRadius: 6))
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(Color(nsColor: .separatorColor))
                )
                .frame(minHeight: 130)

            if case .failure(let message) = model.state {
                Text(message)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .textSelection(.enabled)
                    .lineLimit(8)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: 8) {
                switch model.state {
                case .posting:
                    ProgressView().controlSize(.small)
                    Text("Posting…").foregroundStyle(.secondary)
                case .success(let slug):
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                    Text("Posted \(slug)")
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                default:
                    EmptyView()
                }
                Spacer()
                charCount
                Button("Quit") { NSApp.terminate(nil) }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                Button("Post") { model.post() }
                    .keyboardShortcut(.return, modifiers: .command)
                    .disabled(!model.canPost)
            }
        }
        .padding(12)
        .frame(width: 340)
        .onAppear { model.prefillFromClipboard() }
    }

    // Bluesky counts grapheme clusters with a 300 limit, which is what
    // String.count measures. Soft indicator only — Bridgy truncates long
    // posts and links back rather than rejecting them.
    private var charCount: some View {
        let count = model.text.trimmingCharacters(in: .whitespacesAndNewlines).count
        return Text("\(count)")
            .font(.caption.monospacedDigit())
            .foregroundStyle(count > 300 ? AnyShapeStyle(.red)
                : count > 260 ? AnyShapeStyle(.orange)
                : AnyShapeStyle(.tertiary))
            .help("Characters (Bluesky truncates past 300)")
    }
}
