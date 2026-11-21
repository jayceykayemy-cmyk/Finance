# Finance

A standalone, offline-first Progressive Web App (PWA).

## Publish using GitHub Pages (no coding tools required)

1. Sign in to GitHub and choose **New repository**.
2. Name it `finance`. Choose **Public** (GitHub Pages is available on public repositories on the free plan) and create the repository.
3. Open the new repository and choose **Add file → Upload files**.
4. Extract this ZIP on your computer first. Drag **the contents** of the extracted folder (not the enclosing folder) into the GitHub upload area. You should see `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `sw.js`, and `icon.svg` at the repository's top level.
5. Scroll down, choose **Commit changes**.
6. Open **Settings → Pages**.
7. Under **Build and deployment**, choose **Deploy from a branch**. Select branch `main` and folder `/ (root)`, then click **Save**.
8. Wait a minute or two. Refresh the Pages settings page; GitHub will show your published address, usually `https://YOUR-USERNAME.github.io/finance/`.
9. Open that address in Chrome on your Android phone. Use Chrome's menu (⋮) → **Install app** or **Add to Home screen**.

## Offline use and privacy

- The app stores its entries in this browser's local storage on this device. No account, analytics, advertising, or external database is used.
- The service worker caches the app files after the first successful visit. Open the published link once while online before relying on offline use.
- The app's Google Fonts import is optional decoration; if you are offline, the device uses the built-in fallback fonts. No recipe or finance data is sent to Google.
- Do not clear Chrome's site data or browser storage: doing so can erase your entries. Browser data is not automatically synchronized to another phone or browser.
- Private browsing/incognito is not suitable for keeping entries.
- For best reliability, install and use the app in the same browser on the same device.

## Updating the app

When you receive an updated version, extract it and upload/replace the files in this same repository. Commit the changes. Reopen the app online once so its offline cache can update.

## Important

This is a browser-based PWA, not an APK. It installs from your own GitHub Pages website and works offline after its first online load. GitHub Pages requires HTTPS; its generated address uses HTTPS automatically.
