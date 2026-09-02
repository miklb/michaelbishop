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
}
