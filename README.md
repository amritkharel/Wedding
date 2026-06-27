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

This is a hidden URL, not authentication. In production mode, the page also asks
for an admin secret before it can create or list database-backed invites.

Use the manager to add a guest or family and copy their unique invite URL. In
production mode, the URL stores only a random token. Guest names, invited counts,
groups, and RSVP responses live in the database.

Without a backend URL, the app falls back to prototype mode and stores invites
and RSVPs only in the current browser.

## Production RSVP Backend

Do not store RSVPs by writing to a file in GitHub from the browser. A public
static website cannot safely hold a GitHub token or database secret, and a public
repo would expose guest data. This project is wired for a production setup using
Supabase:

- GitHub Pages hosts the React site.
- Supabase Postgres stores invitations and RSVPs.
- A Supabase Edge Function creates invite tokens, reads a single invite by token,
  saves RSVPs, and protects admin operations with an admin secret.
- Guests only receive a random token in the URL, not editable guest details.

### Supabase Setup

1. Create a Supabase project and copy its **Project Reference** from **Project Settings > General**.
2. Open **SQL Editor** in Supabase, paste the full contents of `supabase/schema.sql`, and click **Run** once.
3. Generate a strong admin secret locally. Keep the output private:

```bash
openssl rand -base64 32
```

4. Log in to Supabase from this project:

```bash
npx supabase login
```

5. Set the private admin secret and allowed browser origins. Replace the placeholders; never put the admin secret in GitHub or a `VITE_` variable:

```bash
npx supabase secrets set \
  ENGAGEMENT_ADMIN_SECRET="PASTE_THE_RANDOM_SECRET" \
  ENGAGEMENT_ALLOWED_ORIGINS="https://amritkharel.github.io,http://127.0.0.1:5173" \
  --project-ref YOUR_PROJECT_REF
```

6. Deploy the public token-based Edge Function. JWT verification is intentionally disabled for this function because guests are authenticated by their random invitation token; admin routes still require the private admin secret:

```bash
npm run deploy:function -- --project-ref YOUR_PROJECT_REF
```

Supabase automatically provides `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.

7. Confirm the backend is alive by opening this URL. It must return `{"ok":true}`:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/engagement-api/health
```

8. Create `.env.local` from `.env.example` for local development:

```bash
cp .env.example .env.local
```

9. Set `VITE_INVITATION_API_URL` in `.env.local` to the deployed function URL:

```text
VITE_INVITATION_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/engagement-api
```

10. Restart the development server and open `/admin-invitations`. Enter the same admin secret, create one test invitation, open its link in a private browser window, submit an RSVP, and confirm the response appears in the manager.

The function accepts browser requests only from localhost, the GitHub Pages origin, and any extra origins listed in `ENGAGEMENT_ALLOWED_ORIGINS`. Add a future custom domain to that comma-separated secret before switching domains.

## Deploy to GitHub Pages

1. In the GitHub repository, open **Settings > Secrets and variables > Actions > Variables**.
2. Create a repository variable named `VITE_INVITATION_API_URL` with this value:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/engagement-api
```

The API URL is public configuration, not a password. Do **not** add `ENGAGEMENT_ADMIN_SECRET` to GitHub; it belongs only in Supabase secrets.

3. Open **Settings > Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Commit and push the production files to `main` or `master`.
6. Open **Actions** and wait for **Deploy to GitHub Pages** to finish successfully.
7. Open the production manager:

```text
https://amritkharel.github.io/Wedding/admin-invitations
```

8. Enter the Supabase admin secret, create a fresh test invitation, submit its RSVP from another browser/device, and verify it appears in the manager.

The site will be available at a URL like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

Production invite links will look like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/invite?g=...
```

GitHub Pages is static hosting, so RSVP responses require the backend above
before real guests can submit responses from different devices.

### Launch Notes

- Recreate production invitations after the backend variable is deployed. Prototype invitations made before backend setup live only in one browser and are not production records.
- Each production invite contains a cryptographically random 128-bit token. The guest name and party details are loaded from Supabase and cannot be edited in the URL.
- Invitation links are bearer links: anyone a guest forwards the link to can view and update that invitation's RSVP. Adding OTP or account login would be required for person-level identity verification.
- The public homepage does not expose the RSVP manager. Knowing the manager URL is not sufficient; listing or creating invitations requires the admin secret.
- Export the RSVP CSV from the manager periodically as an operational backup.
