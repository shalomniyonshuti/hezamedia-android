# HEZA MEDIA — Android app + GitHub + Google Play

Converted from `hezamedia-netlify-drag-drop-v3.zip` while retaining the original news UI, Firestore data, articles, videos, and category navigation.

## Included

- `assets/`: custom HEZA MEDIA Android launcher and splash art.
- `www/`: packaged public mobile web UI with Android-only bottom navigation, Android back navigation and external-link handling. Contains no admin portal.
- `netlify-website/`: unchanged Netlify website **including your existing `admin.html`**, share function and sitemap, for separate deployment.
- `capacitor.config.json`: Android package `com.hezamedia.news` and display name `HEZA MEDIA`.
- `.github/workflows/android.yml`: builds downloadable debug APK and a release AAB; generates branded launcher icons and signs the AAB if secrets are configured.

## 1. Test on computer

Install Node.js 22, Android Studio (Android SDK), and Java 21. Then:

```bash
npm install
npm run preview
```

Visit `http://localhost:8080/?appPreview=1` to preview the mobile tabs in the browser. External Firebase scripts and Firestore news require internet. Firestore rules must grant intended public read permissions.

## 2. Generate the Android project

```bash
npm run android:init
npm run android:sync
npm run android:open
```

Android Studio opens the native project. Select an emulator/device and press Run. After changes to `www/`, run `npm run android:sync` again. **Do not run `android:init` a second time if the `android/` folder already exists.**

## 3. Publish code to GitHub

Create an empty GitHub repository, then in this folder:

```bash
git init
git add .
git commit -m "Initial HEZA MEDIA Android app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hezamedia-android.git
git push -u origin main
```

The **Actions** tab → **Build HEZA MEDIA Android** → **Run workflow** builds the Android APK and release AAB. Download outputs from the workflow run's Artifacts section. A debug APK is for testing; it is not a Play Store submission artifact.

## 4. Sign the AAB for Google Play

Create a *private upload keystore* and keep backups of it, its alias, and passwords. Example (run locally; change identity/password):

```bash
keytool -genkeypair -v -keystore heza-upload.jks -alias heza -keyalg RSA -keysize 3072 -validity 10000
```

GitHub repo → Settings → Secrets and variables → Actions → New repository secret. Add:

| Secret | Value |
|---|---|
| `HEZA_KEYSTORE_BASE64` | Base64 encoding of the **binary** upload keystore (PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('heza-upload.jks'))`) |
| `HEZA_KEYSTORE_PASSWORD` | Keystore password |
| `HEZA_KEY_ALIAS` | Key alias |
| `HEZA_KEY_PASSWORD` | Key password |

Now manually rerun the GitHub workflow. Its `hezamedia-release-aab` artifact is signed when all secrets are valid. Never upload your raw `.jks` or passwords to GitHub; `.gitignore` excludes keystores. Keep the original keystore as a secure backup.

## 5. Google Play Console checklist

1. Register a Google Play Console developer account and complete identity/organization verification.
2. Create app **HEZA MEDIA** → choose **App** and free/paid appropriately. Package ID is `com.hezamedia.news` (change BEFORE first upload if desired).
3. Prepare store icon (512×512), feature graphic (1024×500), screenshots from the real running app, short/long store description, support contact, and public privacy-policy URL.
4. Complete **Data safety**, target audience, content rating, app access, ads declaration and all other required policy forms accurately. Review Firebase/analytics behavior before claiming what data is collected.
5. Enable Play App Signing, upload the **signed** `.aab` to internal testing, test on real phones, resolve review issues, then publish to production when eligible.
6. Set an appropriate `versionCode`/`versionName` in `android/app/build.gradle` for every future release. Comply with the target Android API level required by Google Play at the date of submission; adjust the generated native project as needed.

**Not done automatically:** Google account enrollment, Play Console submission, privacy policy/legal disclosures, push notification backend, app signing keystore, or final Play approval.

## Important limitations

- The Android app is a Capacitor/WebView-based app, **not a full Kotlin rewrite**. It adds mobile-only navigation while retaining your content UI. Some external embedded videos or Google Translate features may behave differently in a WebView; test on Android.
- Firestore content is live only with internet access. Offline may show the page shell without new articles. No notification service is configured.
- `netlify-website/` is the original deployable website; use **its contents**, not the Android repo root, in Netlify drag-and-drop.
- This bundle excludes `admin.html` from `www/`. Your existing admin remains on the separate Netlify website. Firebase authentication and Firestore security rules must be verified before release.
- **No APK/AAB is prebuilt in this archive.** Android SDK/Gradle are needed; GitHub Actions builds the artifacts for you.
