# Deploying Sector Seven

Two separate deploys, because Cloudflare Pages only serves static files and
`server.js` needs a long-lived process (WebSocket connection to F1's live
feed, an in-memory list of SSE clients, SQLite on disk):

1. **Frontend** (`frontend/`) → Cloudflare Pages
2. **Backend** (`server.js` + friends) → Railway, Render, Fly.io, or any
   host that runs a Dockerfile

## 1. Backend

Config for both Render and Railway is already committed, built from the
root `Dockerfile`:

### Render

New → Blueprint → point at this repo → it reads `render.yaml`.

- Builds from `Dockerfile`.
- Health check at `/health`.
- Mounts a persistent disk at `/data` so `f1data.db` survives redeploys
  (`docker-entrypoint.sh` symlinks the db file into it on first boot — no
  app code touched).
- **Render's free tier doesn't support persistent disks.** Either delete
  the `disk:` block in `render.yaml` (accept that saved session history
  resets on every redeploy) or bump `plan:` to `starter` to keep it.

### Railway

New Project → Deploy from GitHub repo → it reads `railway.json` and builds
from the Dockerfile automatically.

- After the first deploy, add a volume in the Railway dashboard mounted at
  `/data` (Railway doesn't support declaring volumes in `railway.json`) —
  same persistence mechanism as Render.
- Health check at `/health`.

### Either way

Once deployed, note the public URL (e.g. `https://sectorseven-api.up.railway.app`
or `https://sectorseven-api.onrender.com`) — the frontend needs it.

## 2. Frontend — Cloudflare Pages

Dashboard → Workers & Pages → Create → Pages → connect this GitHub repo.

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Build output directory | `dist` (already declared in `frontend/wrangler.toml`) |
| Environment variable | `VITE_API_URL` = the backend URL from step 1 |

`frontend/public/_redirects` is already in place so client-side routes
(`/races/:meetingKey`, etc.) don't 404 on a hard refresh.

Push to `main` and both sides redeploy automatically on every commit.

## Verifying it worked

- Backend: `curl https://<your-backend-url>/health` → `ok`
- Frontend: open the Pages URL, check the Network tab for a pending
  `EventSource` request to `/api/live` on your backend's domain — if it's
  still pointing at `localhost:3000`, the `VITE_API_URL` env var didn't get
  picked up (Pages env vars require a redeploy to take effect, not just a
  dashboard save).
