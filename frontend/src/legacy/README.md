# Legacy components

This folder preserves the original pre-redesign UI exactly as it was before
the "Timing Tower" redesign became the main site. Nothing here is imported
by the live app (`src/App.jsx` renders `src/redesign/RedesignApp.jsx`) — it
exists purely for reference.

- `App.classic.jsx` — the original top-level app/router.
- `components/` — the original feature components (Navbar, Hero, Standings,
  RacesList, session results, etc.) and the shadcn/ui primitives they used
  that the redesign doesn't (`button`, `card`, `badge`, `tabs`, `separator`).

The full original site — this code in its original location, wired up and
running — also remains permanently browsable on GitHub at the
[`classic-ui`](../../../../tree/classic-ui) branch, tagged at the exact
commit before the redesign work began.
