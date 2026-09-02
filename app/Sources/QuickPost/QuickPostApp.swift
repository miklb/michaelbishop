import SwiftUI

@main
struct QuickPostApp: App {
    @StateObject private var model = ComposerModel()

    var body: some Scene {
        MenuBarExtra("QuickPost", systemImage: "square.and.pencil") {
            ComposeView(model: model)
        }
        .menuBarExtraStyle(.window)
    }
}
