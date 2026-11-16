# Heza Media

The public news feed is shared by the website and the Android app. Both read from the existing Heza Media Firestore project. The **Amashusho** section uses the site's news cards, displays up to six distinct YouTube videos from published stories, and links to Heza Explorer and Heza Creative. To feature a video, include its YouTube block in a news story using your existing publishing workflow.

## GitHub Pages

1. Extract the ZIP and push the contents of `heza-media/` to the `main` branch of your GitHub repository. Include the hidden `.github` folder.
2. In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
3. In **Actions**, run **Deploy website to GitHub Pages** if the initial push ran before Pages was enabled.
4. Open the URL shown in the deployment job. Test opening a story, playing a video, and loading the site from a phone.

Story share links and SEO metadata keep Heza Media's existing canonical domain. If the Pages URL will replace that domain, update the canonical URLs in `web/index.html`, `web/robots.txt`, and `generate-sitemap.js`. GitHub Pages serves static files, so story-specific Netlify social previews are unavailable on the Pages copy. If article loading is restricted by your Firebase API key settings, authorize the new hosting origin and Android asset origin as applicable to your existing restrictions.

## Android and Google Play

- Package ID: `com.hezamedia.app`. If this is an update to an existing Play listing, match that listing's application ID and increase `versionCode` before building.
- Android target: API 36. The Android home screen icon uses the supplied Heza Media icon. Use `web/icon-512.png` for the Play Store listing icon.
- On GitHub, open **Actions → Build Android → Artifacts → heza-media-android**. Install the debug APK on a phone for testing. The release bundle in that artifact is unsigned.
- To build locally, use JDK 17, Gradle 8.13, Android SDK Platform 36, and Build Tools 35.0.0. Run `gradle -p android :app:assembleDebug :app:bundleRelease` from the project root.
- Open the `android` folder in Android Studio. Choose **Build → Generate Signed Bundle / APK → Android App Bundle** and use your Play upload key. Upload the signed AAB to Play Console, complete the listing and required declarations, and test the release before submitting for review.
- Verify that news loads, the Android Back button closes the reader, and YouTube videos play on a device. Each news video also has a direct YouTube link for videos that restrict embedded playback.
