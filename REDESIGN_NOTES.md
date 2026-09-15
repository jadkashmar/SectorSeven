# Sector Seven — "Timing Tower" Redesign

**Status: this is now the live main site**, promoted from a `/redesign`
preview after several rounds of iteration. `frontend/src/App.jsx` renders
`RedesignApp` directly — the design described below is what visitors see at
`/`, `/live`, `/races`, `/races/:meetingKey`, `/races/:meetingKey/:sessionKey`,
and `/standings`.

Direction: modeled on **F1 broadcast timing-tower graphics** rather than a
generic SaaS/glass template — flat black canvas, bold condensed type, solid
color-blocked status chips, monospace for every data value, thin solid
rules instead of glow/blur.

## Round 10 — promoted to the main site (this pass)

Previously the redesign lived side-by-side with the original site at
`/redesign/*`, mounted alongside a `ClassicApp` component that still served
`/`, `/live`, `/races`, `/standings`, `/track`. This pass made the redesign
the one and only app:

- **`frontend/src/App.jsx` rewritten**: dropped `ClassicApp` and its route
  entirely; `App` now just renders `<RedesignApp />` inside
  `TooltipProvider`. `RedesignApp`'s own internal `<Routes>` (already using
  relative paths like `index`, `live`, `races`) now resolves against the
  site root instead of a `/redesign/*` prefix, so no path changes were
  needed there.
- **Every internal link in `frontend/src/redesign/` had its `/redesign`
  prefix stripped** — `NavbarV2.jsx`, `FooterV2.jsx`, `HeroV2.jsx`,
  `HomeCardsV2.jsx`, `RaceCalendarStripV2.jsx`, `RaceWeekendV2.jsx`,
  `RacesListV2.jsx`, `NotFoundV2.jsx` — so `to="/redesign/races"` etc. are
  now `to="/races"` and so on.
- **Verified end-to-end in-browser**: `/`, `/live`, `/races`,
  `/races/:meetingKey`, `/standings`, and an unmatched path (falls through
  to the 404 page, no crash) — no console errors anywhere, and a full
  `eslint src` pass shows no new issues (the handful that remain are
  pre-existing shadcn/ui scaffold warnings and one pattern shared with the
  original `SessionResults.jsx`, both present before this change).
- **The old classic components were *not* deleted** —
  `components/Navbar.jsx`, `hero.jsx`, `HomeCards.jsx`, `RaceCalendarStrip.jsx`,
  `RaceWeekend.jsx`, `RacesList.jsx`, `SessionResults.jsx`, `Standings.jsx`,
  `ConstructorStandings.jsx`, `DriverStandingsPreview.jsx`, `footer.jsx`,
  `ScrollCarTrack.jsx`, `flag.jsx`, `TrackMap.jsx`, `TrackOutline.jsx`, and
  `lib/useScrollReveal.js` are all still on disk, just no longer imported by
  anything. They're inert, not deleted — say the word if you want them
  cleaned up, or want to keep them around for reference/rollback.

## Original preview notes (rounds 1–9)

The sections below are kept as historical record of how the design was
built and iterated on while it still lived at `/redesign` — they describe
decisions already reflected in the code, not further action items.

## Design direction

- **Reference point**: F1 timing-tower / broadcast lower-third graphics, not
  a SaaS dashboard template. This ties the aesthetic to what the product
  actually is (a live-timing tool) instead of a generic look.
- **Typography**: Barlow Condensed (bold, uppercase, tight leading) for every
  headline — it's an actual motorsport/athletic font pairing, not the
  default Inter-everywhere look. JetBrains Mono for every data value (lap
  times, gaps, points, dates, labels) — reinforces "this is real telemetry,"
  and is a deliberate signal this isn't a generic template. Both loaded via
  `redesign.css`'s own `@import`, scoped under `.redesign-root`.
- **Color**: flat near-black (`#08090a`) background, a slightly raised flat
  surface tone for cards/rows, and the existing brand red used as flat solid
  fills only — no gradients, no glow, no blur anywhere in the system.
- **Chips over badges**: status ("Live" / "Upcoming" / "Completed" / "DNF" /
  "PIT") renders as a small solid rectangular color block with mono
  uppercase text — modeled on a broadcast graphic lower-third, not a rounded
  pill badge.
- **Structure over glass**: cards became bordered/divided blocks with real
  1px lines (`--rd-line` / `--rd-line-strong`), sharp corners, no
  `backdrop-blur`, no translucent glass panels.
- **Motion, dialed back**: hover states are a flat background tint or an
  underline — no scale-on-hover on text, no bouncy easing. Scroll reveals are
  a short, small upward drift (10px, ~380ms) — a cut, not a flourish.

## Round 9 changes (this pass)

Feedback: make the track more complex, shrink the red dot, and make it an
actual cursor-following animation (snapped to the track) rather than an
automatic lap.

- **Track redrawn more complex**: `TRACK_PATH` in `HeroV2.jsx` now has a
  long straight, a sweeping hairpin-adjacent turn, an S-chicane, and a run
  of esses instead of the previous simple oval — reads clearly as a circuit
  rather than a running track.
- **Dot shrunk**: `r="6"` → `r="3"`.
- **Cursor-driven instead of auto-looping**: removed the `<animateMotion>`
  lap entirely. The track path is sampled once into ~400 points
  (`getPointAtLength`) on mount; on every mouse move within the panel, the
  cursor position is mapped into the track's coordinate space and the
  nearest sampled point becomes the marker's target, with a light lerp
  (0.35) toward that target each frame for a touch of smoothing rather than
  a hard snap. The native cursor is hidden (`cursor-none`) while hovering,
  so the red dot reads as the cursor itself, just constrained to the
  circuit line. Confirmed in-browser: hovering near the top of the track
  and then near the left-hand esses moved the dot to the correspondingly
  different point on the line each time.

## Round 8 changes (this pass)

Feedback: scrap the checkered-flag hero hover entirely — instead show a
track outline with a red dot lapping it.

- `HeroV2.jsx`: removed `WavingCheckeredFlag` (and its anime.js strip
  animation) completely. Replaced with `TrackReveal` — a plain SVG circuit
  outline (a stretched oval with a chicane dip, `TRACK_PATH`, filling the
  whole panel via `preserveAspectRatio="none"`) plus a red `<circle>` that
  laps the circuit continuously via `<animateMotion>`/`<mpath>` while
  hovered. No extra library — SVG's native motion-along-a-path primitive.
  Mounting the `<animateMotion>` tag only while `active` is what starts the
  lap fresh on every hover and stops it on leave; confirmed in-browser by
  comparing two frames a second apart, which show the dot having moved from
  the top of the loop down into the chicane.
- Idle state is unchanged: logo centered on plain black, nothing else.

## Round 7 changes (this pass)

Feedback: the ticker under the hero still wasn't centered correctly, and the
"2026 Championship — Round 15 of 24" eyebrow above the hero should go.

- **Removed the eyebrow line** above the hero panel in `HeroV2.jsx`.
- **Actually fixed the ticker this time.** The previous fix (keying the
  track on content change) addressed a jump when data arrived, but the
  underlying "not centered" complaint was a different bug: the marquee
  duplicates one phrase into two halves and scrolls `translateX(-50%)`, but
  if a single copy of the ticker phrase is narrower than the viewport (very
  likely — it's often just one or two short strings), each "half" doesn't
  actually fill the row. That leaves visible gaps mid-loop, which reads as
  the text sliding around off-center rather than scrolling smoothly
  edge-to-edge. Fixed by repeating the phrase 8× per half
  (`buildTickerHalf` in `HeroV2.jsx`) so each half comfortably exceeds any
  realistic viewport width — confirmed in-browser at both desktop and
  375px mobile widths that the strip now stays completely filled,
  edge-to-edge, throughout the loop.

## Round 6 changes (this pass)

Feedback: the checkered flag should be a genuinely animated 3D-waving flag,
not a static (or merely drifting) pattern.

- First attempt used an SVG filter chain (`feTurbulence` + `feDisplacementMap`
  + `feDiffuseLighting`) for a physically-simulated cloth ripple. It's a real
  technique, but tuning it blind rendered far too faint/washed-out to read as
  a flag — not worth fighting further.
- Replaced it with the same technique this app already uses successfully for
  its existing animated flag (`components/Flag.jsx`, untouched): slice the
  panel into ~18 thin vertical strips sharing one continuous checkered
  pattern (`background-attachment: fixed` keeps every strip's slice
  perfectly in phase with its neighbors, so it reads as one unbroken
  checkerboard, not a strip of separate tiles), then animate each strip's
  `skewY`/`scaleY` independently with a staggered delay via anime.js. The
  out-of-phase motion across strips is what makes it read as rippling cloth
  in 3D — confirmed by comparing two frames a second apart, which show
  clearly different diagonal warping across the checker squares.
- Runs only while the panel is hovered (`active`), pauses on leave, and is
  skipped entirely under `prefers-reduced-motion`.

## Round 5 changes (this pass)

Feedback: the checkered-flag hover reveal should cover the *whole* panel,
not just a soft circle around the cursor.

- `LogoPanel` in `HeroV2.jsx`: removed the `radial-gradient` mask so the
  checkered pattern now fills the entire square the instant it's hovered,
  logo still legible on top, still continuously drifting
  (`rd-flag-wave-bg`) for as long as the pointer stays inside, still fully
  hidden at idle. Also dropped the now-unused cursor-position tracking for
  the mask (`--mx`/`--my`) since the reveal no longer depends on pointer
  position — only the logo's 3D tilt still does.

## Round 4 changes (this pass)

Feedback: the hero's hover effect should reveal a checkered flag (not a
telemetry grid/crosshair/custom cursor), the sector labels needed to go, the
ticker under the hero had a visible glitch, and the site needed a real mobile
pass.

- **Hero hover effect replaced.** `LogoPanel` in `HeroV2.jsx` is back to
  exactly what was asked: idle = the SECTOR7 logo centered on a plain black
  panel, nothing else. On hover, a checkered-flag pattern reveals in a soft
  circular radius around the cursor (a CSS mask reveal, same technique as
  before, just a checkerboard instead of a grid) and drifts diagonally the
  whole time the pointer is inside (`rd-flag-flow` keyframe in
  `redesign.css`) so it visibly "moves" rather than sitting static. Removed
  entirely: the crosshair lines, the X/Y coordinate readout, the
  "SECTOR SEVEN / TEL-01" / "STANDBY" / "TRACKING" labels, the blueprint
  corner ticks, and the custom cursor-flag icon from last round — none of
  that was asked for once the ask was clarified, and it was cluttering what's
  supposed to be a clean logo card. The subtle 3D tilt-toward-cursor stayed,
  since "keep the design you did" for the logo itself.
- **Sector labels removed.** `SectorReveal.jsx` no longer takes or renders a
  `label`/`title` — it still does the left-edge red bar draw-in on scroll,
  just without the "S1 Telemetry" / "S2 Schedule" / "S3 Standings" text.
  Updated the three call sites in `RedesignApp.jsx` to match.
- **Ticker glitch fixed.** The hero's marquee text changes once, live, when
  session/next-race data arrives — that changes the track's width while its
  `translateX(-50%)` animation is mid-cycle, which made the loop visibly
  jump/misalign (this is what read as "moving sideways, not centered
  correctly"). Fixed by keying the track div on the ticker text
  (`key={tickerText}` in `HeroV2.jsx`), forcing a clean remount whenever the
  content changes instead of a live recalculation mid-animation.
- **Mobile pass** — actually resized the browser to 375px and walked every
  page rather than guessing:
  - `NavbarV2.jsx` had a real bug: on narrow screens the logo, all four nav
    links, and the live-session chip were competing for one row and visibly
    overlapping/clipping. Restructured to two rows below `md`: logo + chip
    on top, a horizontally-scrollable nav row underneath.
  - `RaceCalendarStripV2.jsx` had a real bug: the status chip's fixed
    `w-[5.5rem]` plus the index number left almost no room for the race
    name on a 375px row, so titles like "Marina Bay Grand Prix" truncated to
    "Marina …". Hid the index number below `sm`, and let the chip size to
    its content on mobile instead of a fixed width.
  - Everything else — hero, race cards, race weekend, session results,
    live timing table, standings, footer, 404 — was already responsive from
    earlier rounds (the tables already hide secondary columns below `sm`)
    and held up correctly under inspection; no changes needed there.

## Round 3 changes (this pass)

Feedback: the hero needed a cursor-following checkered flag on hover, the
home page needed more scroll life, the site needed loading skeletons instead
of "Loading…" text, and a 404 page.

- **Checkered-flag cursor on the hero.** Hovering the logo panel now hides
  the native cursor (`cursor-none`) and replaces it with a small waving
  checkered flag (`CheckeredCursor` inside `HeroV2.jsx`) that plants exactly
  at the pointer and waves continuously (`rd-flag-wave` keyframe — a plain
  skew oscillation, no glow) while tracking mouse movement via the same
  `requestAnimationFrame` loop already driving the tilt/crosshair. Disabled
  under `prefers-reduced-motion`.
- **More scroll life on the home page:**
  - `components/CheckeredDivider.jsx` — a start/finish-line strip of
    checkered squares between the hero and the rest of the page that snaps
    open left-to-right (anime.js stagger) the first time it scrolls into
    view.
  - `lib/useCountUp.js` — driver/constructor points now count up from 0 the
    first time each standings list scrolls into view, instead of appearing
    instantly.
  - Hero scroll parallax (`useHeroParallax` in `HeroV2.jsx`) — the logo
    panel drifts and fades slightly as it scrolls out of view, for depth.
  - (The sector-split reveal and scroll-progress rail from the previous
    round are still in place and unchanged.)
- **Loading skeletons everywhere data was previously just "Loading…" text
  or a blank gap:** `components/Skeleton.jsx` is a single flat block with a
  soft light sweep (`rd-skeleton`/`rd-shimmer` in `redesign.css`, static
  under reduced motion), used in `HomeCardsV2`, `RaceCalendarStripV2`,
  `RacesListV2`, `RaceWeekendV2`, `DriverStandingsPreviewV2`,
  `ConstructorStandingsV2`, `StandingsV2` (live timing table), and
  `SessionResultsV2`.
- **404 page**: `components/NotFoundV2.jsx`, wired as a catch-all
  `<Route path="*">` inside `RedesignApp.jsx`'s routes — styled as a dropped
  broadcast feed ("No Signal — Sector Not Found") rather than a generic 404
  card, consistent with the rest of the system's telemetry language. Scoped
  to `/redesign/*` only, since the classic app's routing wasn't touched.

## Round 2 changes

Feedback on the first pass: the hero card needed to be interactive again
(mouse-move) but scoped to just the logo, the scroll-linked car and the
line-art car section both felt lifeless and were cut, the races section
needed more life and guaranteed flags, and the Track feature was removed
from the site entirely so its nav entry/route needed to go.

- **Hero rebuilt around a single interactive panel.** `HeroV2.jsx` now shows
  *only* the "SECTOR7" wordmark inside a bordered instrument panel. On mouse
  move it: tilts the logo in 3D (`rotateX`/`rotateY` toward the cursor),
  brightens a faint schematic grid in a radius around the cursor (a mask
  reveal, not a color glow), and draws a crosshair with a live mono
  coordinate readout (`X 0.51 · Y 0.37`) — a telemetry-HUD interaction built
  from plain lines and text, not the old glass-panel spotlight. Tagline/CTAs
  live below the panel, outside it, matching "the hero card should only
  display the logo."
- **Removed `ScrollCarTrackV2.jsx` and `HeroDriveSection.jsx` entirely** (the
  scroll-linked car and the line-art car section below the hero) — deleted,
  not just hidden.
- **New F1-themed scroll interactions replace them:**
  - `components/SectorReveal.jsx` — each major home-page section now enters
    the way a sector split animates on a real timing screen: a red bar draws
    down the left edge, an `S1`/`S2`/`S3` mono label flashes in, then the
    content settles — instead of a generic fade-up.
  - `components/SectorProgressRail.jsx` — a fixed vertical rail on the right
    edge (desktop only) that fills as you scroll, with a small diamond
    marker gliding down it and a live percentage readout, styled like a
    car's position on a mini track map. Hidden under
    `prefers-reduced-motion` since it's pure scroll decoration.
- **Races revamped for guaranteed flags + more life:**
  - `lib/flags.js` — a name-based fallback (`Bahrain` → `bh`, etc.) layered
    on top of the existing `getFlagCode(countryCode)`, so cards still show a
    flag even when OpenF1 hasn't populated `country_code` yet (this was
    happening for the early-season "TBD" placeholder sessions, which
    previously rendered with no flag at all).
  - `RacesListV2.jsx` — each card now gets a colored left status bar, a
    large translucent flag watermark tinting the card background, a bigger
    inline flag next to the name, and a hover state (lift + reveal arrow +
    watermark scale) instead of a static block.
  - `RaceCalendarStripV2.jsx` (home page strip) also gained the same flag
    fallback so its rows are consistent with the full races page.
- **Track section removed from the redesign** — `TrackMapV2.jsx` deleted,
  and the `/redesign/track` route plus its nav/footer links removed. The
  classic app's own `/track` route and `TrackMap.jsx` are untouched (not in
  scope — that's the live app's functional side).

## New files

All under `frontend/src/redesign/`:

| File | Notes |
|---|---|
| `RedesignApp.jsx` | Route table + layout for `/redesign` |
| `redesign.css` | Design tokens, font imports, chip/rule/ticker utilities — scoped to `.redesign-root` only |
| `lib/motion.js` | `prefers-reduced-motion`-aware anime.js helper (`safeAnimate`, `revealStagger`) |
| `lib/useRevealV2.js` | Scroll reveal hook — IntersectionObserver primary trigger backed by a position-check fallback so content can't get stuck at `opacity: 0` under a fast/instant scroll |
| `lib/flags.js` | Country-name fallback for flag codes when `country_code` is missing from the API |
| `components/NavbarV2.jsx` | Flat black bar, thin red rule underneath, mono nav labels, solid chip for live status |
| `components/FooterV2.jsx` | Same content as the original footer, flat layout |
| `components/HeroV2.jsx` | Mouse-interactive logo-only panel (see above) + tagline/CTAs + live data ticker strip |
| `components/SectorReveal.jsx` | Sector-split-style section entrance animation |
| `components/SectorProgressRail.jsx` | Fixed scroll-progress rail with a position marker |
| `components/HomeCardsV2.jsx` | 3-up stat strip with vertical dividers instead of glass cards |
| `components/RaceCalendarStripV2.jsx` | Row list with mono index, status chip, flag, flat hover tint |
| `components/DriverStandingsPreviewV2.jsx` / `ConstructorStandingsV2.jsx` | Row list, flat progress bar, mono points column |
| `components/RacesListV2.jsx` | Bordered card grid with guaranteed flags, status accent bar, hover motion |
| `components/RaceWeekendV2.jsx` | Session columns, bordered rows |
| `components/SessionResultsV2.jsx` | **Boxed-table layout intentionally preserved**, restyled with mono data columns and flat DNF chip |
| `components/StandingsV2.jsx` | Live timing table — memoized row (`React.memo`, stable ref callbacks, `useMemo` join) so a per-tick SSE update doesn't re-render every row |

`lib/config.js`, `lib/teamLogos.jsx`, `lib/countryCodes.js`, `lib/utils.js`
are reused directly from the classic app, unmodified — pure data/logic, not
part of the presentation pass.

## What wasn't touched

All data-fetching, SSE handling, SQLite queries, and API logic are exactly
as they were — every redesigned component fetches from the same endpoints
using the same `API_URL`/`EventSource` patterns as the original.
