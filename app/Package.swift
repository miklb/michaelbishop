// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "QuickPost",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(name: "QuickPost", path: "Sources/QuickPost")
    ]
)
