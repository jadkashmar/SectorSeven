# Sector Seven

A live Formula 1 timing and results hub. A Node/Express backend connects
directly to F1's live timing feed over WebSocket, decodes and rebroadcasts
it over Server-Sent Events, and persists sessions/results/standings to
SQLite; a React frontend renders it as a real-time timing tower — live
driver standings, sector times, tyre data, race calendars, and session
results, styled after broadcast graphics rather than a generic dashboard.

## Stack

- **Backend**: Node.js, Express, `better-sqlite3`, `ws` (F1 live timing feed
  client), Server-Sent Events for pushing live updates to the browser.
- **Frontend**: React 19, Vite, React Router, Tailwind CSS v4, shadcn/ui
  (a small subset — see below), anime.js for scroll/interaction animation.
- **Data sources**: Formula 1's official live timing feed (session-live
  data), [OpenF1](https://openf1.org/) and [Jolpica-F1](https://jolpi.ca/)
  (schedule, historical results, standings).

## Project layout

```
server.js              Express app: SSE endpoint, REST API, live feed wiring
f1client.js             WebSocket client for F1's live timing feed
parsers.js               Decodes/normalizes the raw feed messages
db.js                    SQLite schema + persistence helpers
scripts/                 One-off maintenance scripts (backfilling results/standings)
frontend/
  src/
    App.jsx              App entry — renders the redesign as the main site
    redesign/             The live UI ("Timing Tower" design)
    legacy/                Preserved original UI, not built/imported — see below
    lib/, components/ui/   Shared data helpers + the shadcn/ui primitives actually in use
```

## Running it locally

Requires Node.js and two terminals (backend + frontend dev server).

```bash
# Backend
npm install
npm run start   # or: node server.js — serves the API + SSE feed on :3000

# Frontend
cd frontend
npm install
cp .env.example .env   # points the frontend at the backend above
npm run dev             # Vite dev server, defaults to :5173
```

## The redesign

The current UI ("Timing Tower") went through several rounds of design
iteration — see [`REDESIGN_NOTES.md`](REDESIGN_NOTES.md) for the full history
of decisions, what was tried and discarded, and why.

The **original UI** is preserved two ways:

- On disk, inert, at [`frontend/src/legacy/`](frontend/src/legacy/README.md)
  — not imported by the live app, kept for reference.
- Fully wired up and running, on the
  [`classic-ui`](https://github.com/jadkashmar/SectorSeven/tree/classic-ui)
  branch, exactly as it was before the redesign began.
