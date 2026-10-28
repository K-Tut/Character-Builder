# Phone app setup

The app can run on any phone: it gets a home-screen icon, opens full-screen and works offline at the table.
For that, the app code has to be on a website once. GitHub Pages does this for free.
**Only you need to do Part A. Your friends just open your link.**

---

## A. Put the app online (one time, ~10 min)

1. Create a free account at https://github.com.
2. Click **+ → New repository**. Name it `dnd-builder`, choose **Public**, then click **Create repository**.
3. Click **"uploading an existing file"**. Unzip `app-files-for-github.zip` and drag **all 14 files** in, then click **Commit changes**.
   (These are only the app code. Your characters and the rules text are **not** uploaded.)
4. Go to **Settings → Pages**. Under "Branch", choose **main** and **/(root)**, then click **Save**.
5. After 1–2 minutes the app is live at **`https://YOUR-USERNAME.github.io/dnd-builder/`**.

## B. Install on the phone

1. Open that link in **Chrome** on the Pixel.
2. Tap **⋮ → Add to Home screen → Install**.

## C. Get characters and rules text onto the phone (simple way, no Google setup)

**Characters**
1. On the laptop, open the character and click **⤓ Export**. This saves e.g. `Tyler.json` to your Downloads.
2. Send that file to your phone (WhatsApp, email, Google Drive, USB… anything).
3. In the app on the phone, tap **⤒ Import** on the home screen and pick the file.
   - Importing a newer version of the same character replaces the old one. It won't create a duplicate.
   - On the phone, **⤓ Export** opens Android's share menu, so you can send the character straight back to the laptop and import it there.

**Rules text (feature and spell descriptions)**: once, and again after you update it:
1. The file is `data\wiki.json` in your dnd-builder folder on the laptop.
2. Send it to the phone, then in the app tap **Load wiki.json file…** (bottom of the home screen).

## Friends

- **Just open the app:** send them your link `https://YOUR-USERNAME.github.io/dnd-builder/`. No Python, no GitHub, no Google setup. They open it and install it (step B).
- **Rules text:** send them your `wiki.json` once, so they get the descriptions.
- **Characters:** their characters are saved on their own phone. They can export and import files the same way you do.

---

## Optional: automatic sync via Google Drive

Only if you want changes to appear on the other device by themselves, without exporting and importing.
It uses a hidden app folder in your Google Drive. The setup is done **once by you**:

1. In https://console.cloud.google.com/, create a new project and enable the **Google Drive API**.
2. Under **OAuth consent screen**, choose **External** and fill in the app name and your email.
3. Under **Test users**, add your Gmail address, plus the Gmail of each friend who also wants sync (up to 100).
4. Go to **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorized JavaScript origins: `https://YOUR-USERNAME.github.io`, `http://localhost:8765` and `http://localhost:8766` (the last one is for the DM Tool on the laptop).
5. Copy the Client ID and paste it into `config.js` in your GitHub repo (click ✏️ to edit, then commit).

After that, anyone on the test user list just taps **Connect Google Drive** in the app. Google shows a "not verified" warning; tap Continue. Each person syncs with **their own** Drive.

When the cloud icon shows "Reconnect", tap it. Google's sign-in lasts one hour at a time.
