# Jadefall Android app

This directory is the native Android wrapper/build project for Jadefall.

## Build an APK

1. Install Android Studio with an Android SDK.
2. Open this `android` directory as a project.
3. Let Gradle sync.
4. Run `./gradlew assembleDebug` (or `gradlew.bat assembleDebug` on Windows).
5. The APK will be under `app/build/outputs/apk/debug/`.

For a release APK/AAB, configure a signing key in Android Studio and use `assembleRelease` / `bundleRelease`.

The app launches the bundled web game from `app/src/main/assets/www/index.html`. The asset folder is intentionally kept as a copy of the web build so the Android app can run without the browser UI.
