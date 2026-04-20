#!/bin/bash

# --- Robust Build Script for Legacy Architecture ---

echo "🚀 Starting Deep Clean..."

# 1. Deep Clean
rm -rf android/app/.cxx
rm -rf android/app/build
rm -rf android/.gradle
rm -rf node_modules
# rm yarn.lock package-lock.json # Optional: uncomment if you want to fresh install

echo "📦 Refreshing Dependencies..."
npm install

echo "🎨 Bundling Assets Manually..."
# This ensures the JS bundle and assets are generated even if the automated gradle task fails
mkdir -p android/app/src/main/assets
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

echo "🏗️ Building Release APK (Excluding problematic native build tasks)..."
cd android || exit 1
./gradlew clean || exit 1
./gradlew assembleRelease \
  -x externalNativeBuildDebug \
  -x externalNativeBuildRelease \
  -x lint || exit 1
cd ..

echo "✅ Build Process Complete!"
echo "📍 APK Location: android/app/build/outputs/apk/release/app-release.apk"
