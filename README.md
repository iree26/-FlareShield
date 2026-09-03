# FlareShield

A self-contained, client-only demo of a pipeline theft (illegal tap) detection
system, built for a live software demonstration in front of an audience.
Everything — sensor readings, the simulated tap, and detection — runs
entirely in the browser. There is no backend, no database, no API calls,
and no persistence (no `localStorage`, nothing saved between reloads).

## Running it

```
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

- `npm run build` — static production build to `dist/`
- `npm run preview` — serve that production build locally
- `npm run lint` — Oxlint

## What it demonstrates

Oil pipelines are monitored by sensor nodes placed at intervals along the
line, each reporting pressure and flow. When someone illegally taps the
pipe, fluid is diverted out partway along a segment, so the flow measured
entering that segment stops matching the flow measured leaving it, and
pressure downstream of the tap sags. FlareShield simulates that whole
chain end to end: realistic live sensor noise → a simulated tap → mass-
balance detection → a confirmed alert with a plain-language incident
brief — and a second tab that scores every segment's theft risk so a
patrol team knows where to look *before* anything happens.

Read the comment at the top of `src/App.jsx` for the detection principle,
and `src/lib/simulation.js` for the actual model and detection algorithm.

## Tabs

**Live Monitor**
- A pipeline graphic with 7 sensor nodes bounding 6 segments, rendered as
  a real thick pipe with an animated flow-dot pattern (speed reflects the
  actual simulated flow rate).
- Live pressure/flow readings drift with small random noise every second,
  in balance across every segment under normal conditions.
- **Simulate Illegal Tap** picks a segment (chosen from the dropdown, or
  random) and starts a leak: its downstream flow and pressure begin to
  drop, and fluid visibly diverts out of the pipe at the tap point
  (a stub pipe, falling droplets, a pulsing marker).
- The detector compares flow between every adjacent node pair. A segment
  glows amber while the mismatch is confirming across several consecutive
  readings (to ignore ordinary sensor noise), then turns red once a tap is
  confirmed, at which point:
  - A detection-latency counter (time from tap to confirmed alert) freezes
    on-screen.
  - The **Incident Brief** panel fills in with the affected segment,
    estimated location in km, severity, pressure/flow evidence, and a
    recommended action — generated locally from a template, no external
    calls.
  - A live mini pressure/flow chart for the two bounding nodes shows the
    readings visibly diverging over the last ~20 seconds.
  - A soft, non-flashing red vignette and accent shift signal the alert
    state across the whole page.
- **Reset** clears the incident and returns everything to normal so the
  demo can be run again, repeatedly, without reloading the page.

**Risk Ranking**
- Ranks all 6 segments by a 0–100 theft-risk score, combining synthetic
  historical incident counts and access-road proximity (both clearly
  labeled as illustrative, not real field data) with a live boost when a
  segment is currently investigating or has a confirmed tap.
- Useful as the "before an incident" half of the demo: which stretches of
  pipe should a patrol prioritize.
- The simulation keeps running in the background regardless of which tab
  is open; the Live Monitor tab shows a small red badge if an alert is
  active while you're on Risk Ranking. Clicking a row jumps back to Live
  Monitor with that segment selected.

## Honesty labeling

A "● Simulated data" badge is visible in the header at all times, and the
footer restates that everything on screen is synthetic, generated
in-browser, with no live field data or network connection.

## Project structure

```
src/
  App.jsx                    Top-level layout, tab switching, simulation loop
  index.css                  Tailwind import + custom flow/leak/alert animations
  lib/
    simulation.js            Sensor model, tap physics, mass-balance detection
    risk.js                  Risk-ranking score model
  components/
    ControlPanel.jsx         Tap target picker, Simulate/Reset buttons, status
    TabBar.jsx                Live Monitor / Risk Ranking tab switcher
    PipelineHero.jsx          The pipe graphic, flow animation, leak effect
    StatusSummary.jsx         Segment count / normal / investigating / alert tiles
    ReadingsChart.jsx         Lightweight SVG pressure/flow mini-charts
    IncidentBrief.jsx         The generated alert panel
    RiskRanking.jsx           The risk-ranking tab
```

## Tech

React + Vite + Tailwind CSS v4, no other runtime dependencies. Charts and
the pipe graphic are hand-built with SVG/CSS — no charting or animation
library.
