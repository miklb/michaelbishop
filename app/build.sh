#!/bin/bash
# Build QuickPost.app with Command Line Tools only (no Xcode needed).
set -euo pipefail
cd "$(dirname "$0")"

swift build -c release

APP=build/QuickPost.app
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cp .build/release/QuickPost "$APP/Contents/MacOS/"
cp Info.plist "$APP/Contents/"
codesign --force --sign - "$APP"

echo "Built $APP"
echo "Run:     open $PWD/$APP"
echo "Install: cp -R $PWD/$APP /Applications/"
