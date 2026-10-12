# How to build the Calling Bird APK

```powershell
cd D:\SharedFolder\Projects\auto-announcement\mobile-app
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug
Move-Item -Force app\build\outputs\apk\debug\app-debug.apk "$env:USERPROFILE\Downloads\CallingBird.apk"
```

Output: `Downloads\CallingBird.apk`
