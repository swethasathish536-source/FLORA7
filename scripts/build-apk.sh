#!/usr/bin/env bash
set -e

BUILD_DIR="/tmp/android-build"
mkdir -p "$BUILD_DIR/src/com/flora7/loveunfolded" \
         "$BUILD_DIR/res/values" \
         "$BUILD_DIR/res/mipmap-xxxhdpi" \
         "$BUILD_DIR/bin" \
         "$BUILD_DIR/gen"

# Copy icons
cp public/pwa-192x192.png "$BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
cp public/pwa-192x192.png "$BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher_round.png"

# Generate R.java
aapt package -f -m -J "$BUILD_DIR/gen" -S "$BUILD_DIR/res" -M "$BUILD_DIR/AndroidManifest.xml" -I /tmp/android.jar

# Compile Java classes with ECJ
java -jar /tmp/ecj.jar -7 -cp /tmp/android.jar -d "$BUILD_DIR/bin" "$BUILD_DIR/gen/com/flora7/loveunfolded/R.java" "$BUILD_DIR/src/com/flora7/loveunfolded/MainActivity.java"

# Convert to DEX with D8
java -cp /tmp/r8.jar com.android.tools.r8.D8 --lib /tmp/android.jar --output "$BUILD_DIR/bin" "$BUILD_DIR/bin/com/flora7/loveunfolded/"*.class

# Package APK
aapt package -f -M "$BUILD_DIR/AndroidManifest.xml" -S "$BUILD_DIR/res" -I /tmp/android.jar -F "$BUILD_DIR/bin/unsigned.apk"
cd "$BUILD_DIR/bin" && aapt add unsigned.apk classes.dex

# Align
zipalign -v -p 4 "$BUILD_DIR/bin/unsigned.apk" "$BUILD_DIR/bin/aligned.apk"

# Sign
apksigner sign --ks "$BUILD_DIR/flora7.keystore" --ks-key-alias flora7 --ks-pass pass:flora7love --key-pass pass:flora7love --out "$BUILD_DIR/flora7.apk" "$BUILD_DIR/bin/aligned.apk"

# Copy to public
cp "$BUILD_DIR/flora7.apk" public/flora7.apk
cp "$BUILD_DIR/flora7.apk" public/flora7-loveunfolded.apk
echo "APK build complete: public/flora7-loveunfolded.apk"
