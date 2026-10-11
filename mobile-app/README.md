# Calling Bird — Android app

A native Android WebView wrapper that opens the Calling Bird web app (`WEB_URL`).

## Configuration (`.env`)

```env
WEB_URL=https://{subdomain}.softproit.cloud
```

- `.env` is read at **build time** and injected into `BuildConfig.WEB_URL`. If `.env` is missing, `.env.example` is used.
- If `WEB_URL` contains `{subdomain}`, the app asks for the subdomain on first launch
  (e.g. `cb2` → `https://cb2.softproit.cloud`) and remembers it.
  It can be changed later from the exit dialog (press back on the home page) or the connection-error screen.
- To ship an APK that is locked to one institution, set a full URL instead, e.g. `WEB_URL=https://cb2.softproit.cloud`.

## Build

Needs the Android SDK and a JDK 17+ (Android Studio's bundled JBR works).

```bash
# Windows (Git Bash)
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
./gradlew assembleDebug      # -> app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease    # -> app/build/outputs/apk/release/ (signed if keystore.properties exists)
```

Or open the `mobile-app` folder in Android Studio and use **Build → Build APK(s)**.

`local.properties` (`sdk.dir=...`) is machine-specific and not committed; Android Studio creates it automatically.

### Release signing

```bash
keytool -genkey -v -keystore callingbird.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callingbird
```

Then create `mobile-app/keystore.properties` (git-ignored):

```properties
storeFile=callingbird.jks
storePassword=...
keyAlias=callingbird
keyPassword=...
```

## What the wrapper provides to the web app

| Web feature (front-end) | Android handling |
|---|---|
| Audio recording — `getUserMedia({ audio: true })` in `AudioRecorAndUpload.vue` | Asks for `RECORD_AUDIO` and grants the WebView mic access |
| Image upload — `<input type="file" accept="image/*">` in `StudentAddEdit.vue` | File picker + camera option (asks for `CAMERA`) |
| Audio / Excel upload — `AudioUpload.vue`, `FileUpload.vue` | System file picker filtered by `accept` |
| Excel export — blob download in `Import.vue` | Saved to the phone's **Downloads** folder |
| Printing — `printDiv()` in `main.js`, `window.print()` | Android print dialog (print or save as PDF) |
| Announcement audio autoplay | Media playback without a user gesture is allowed |

Links to other domains open in the external browser. The page can detect the app via
`window.CallingBirdApp` or `CallingBirdApp/<version>` in the user agent.
