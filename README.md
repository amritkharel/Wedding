# Wedding Website

Mobile-friendly wedding homepage plus personalized invitation links and RSVP forms.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Customize

Edit `weddingConfig` near the top of `src/main.jsx`:

- `coupleNames` and `shortNames`
- `engagementDate`, currently set to `2026-09-06T18:00:00-05:00`
- `weddingDate`, left blank for now
- venues, contact email, story cards, and timeline entries
- hero/invite/story image paths

When `weddingDate` is blank, the countdown targets the engagement. After the engagement passes, it will keep targeting the engagement unless a wedding date is added.

## Invitation Links

Use the "Invitation links" section on the homepage to add a guest or family and copy their unique invite URL. The URL stores guest name, party size, group, and ID in the link token so the invitation page can personalize itself.

RSVP responses are currently saved in the browser and can be exported as CSV from the homepage. For real guest collection after deployment, add an API URL to `rsvpEndpoint` in `weddingConfig`; the app will POST each RSVP there as JSON.

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
