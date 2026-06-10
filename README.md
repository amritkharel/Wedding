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
# Wedding
