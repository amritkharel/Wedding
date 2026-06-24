# Engagement Party Website

Mobile-friendly engagement party homepage plus personalized invitation links and RSVP forms.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Customize

Edit `engagementConfig` near the top of `src/main.jsx`:

- `coupleNames` and `shortNames`
- `engagementDate`, currently set to `2026-09-06T18:00:00-05:00`
- `nextEventDate`, left blank for now if you later want the countdown to move to another celebration
- venues, contact email, moments, and invitation image paths
- hero/invite/story image paths

When `nextEventDate` is blank, the countdown targets the engagement. After the engagement passes, it will keep targeting the engagement unless another celebration date is added.

## Invitation Links

The invitation manager is intentionally omitted from the public homepage. Open:

```text
https://YOUR-DOMAIN/admin-invitations
```

For GitHub Pages, that is:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/admin-invitations
```

This is a hidden URL, not authentication. Anyone who learns the URL can open it because GitHub Pages is a static host.

Use the manager to add a guest or family and copy their unique invite URL. The URL stores guest name, suggested party size, group, and ID in the link token so the invitation page can personalize itself.

RSVP responses are currently saved only in the browser where the guest submits them. They do not automatically appear on your device. For real guest collection, add a hosted API/database URL to `rsvpEndpoint` in `engagementConfig`; the app will POST each RSVP there as JSON.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Push to `main` or `master`.
6. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish.

The site will be available at a URL like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

Personal invite links will look like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/invite?g=...
```

GitHub Pages is static hosting, so RSVP responses still need a backend/database before real guests can submit responses from different devices.
