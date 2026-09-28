# Deploying Sector Seven

Two separate deploys, because a static host only serves files and
`server.js` needs a long-lived process (WebSocket connection to F1's live
feed, an in-memory list of SSE clients, SQLite on disk):

1. **Frontend** (`frontend/`) → Vercel
2. **Backend** (`server.js` + friends) → Render (or Railway/Fly.io/any host
   that runs a Dockerfile)

## 1. Backend

### Render (current setup — free tier)

New → Blueprint → point at this repo → it reads `render.yaml`.

- Builds from `Dockerfile`, plan `free`, health check at `/health`.
- **No persistent disk** — Render's free tier doesn't support them. This is
  fine: live timing is entirely in-memory (WebSocket feed → SSE broadcast),
  it never touches the database. Only `/api/sessions` and past session
  results/standings depend on `f1data.db`, and those just reset whenever
  the free instance restarts.
- If you later upgrade to a paid plan (or move to Railway/Fly.io) and want
  that history to actually persist, add a disk/volume mounted at `/data` —
  `docker-entrypoint.sh` already symlinks `f1data.db` into it automatically
  when it detects one, no code changes needed.

### Railway (alternative)

New Project → Deploy from GitHub repo → it reads `railway.json` and builds
from the Dockerfile automatically. Same `/data` volume trick applies if you
add one via the dashboard (Railway doesn't support declaring volumes in
`railway.json`).

### Either way

Once deployed, note the public URL (e.g. `https://sectorseven-api.onrender.com`)
— the frontend needs it.

## 2. Frontend — Vercel

Already connected via GitHub integration, live at `sectorseven.jadkashmar.dev`.

- Project root directory: `frontend`.
- Environment variable: `VITE_API_URL` = the backend URL from step 1 (set
  in Vercel → Project Settings → Environment Variables, then redeploy —
  env var changes don't apply retroactively to the current deployment).
- `frontend/vercel.json` adds the SPA rewrite so client-side routes
  (`/races/:meetingKey`, etc.) don't 404 on a hard refresh.

Push to `main` and both sides redeploy automatically on every commit.

## Verifying it worked

- Backend: `curl https://<your-backend-url>/health` → `ok`
- Frontend: open the site, check the Network tab for a pending
  `EventSource` request to `/api/live` on your backend's domain — if it's
  still pointing at `localhost:3000`, the `VITE_API_URL` env var didn't get
  picked up (needs an explicit redeploy after setting it, not just a
  dashboard save).
