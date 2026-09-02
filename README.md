# FlareShield

A self-contained, client-only demo of a pipeline theft (illegal tap) detection
system, built for a live software demonstration. Everything — sensor
readings, the simulated tap, and detection — runs entirely in the browser.
There is no backend, no database, and no persistence.

## Running it

```
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static
production build; `npm run lint` runs Oxlint.

## How it works

Read the comment at the top of `src/App.jsx` for the detection principle
(mass balance between adjacent sensor nodes), and `src/lib/simulation.js`
for the simulation model and detection algorithm itself.

- A horizontal pipeline is shown with 7 sensor nodes bounding 6 segments.
- Live pressure/flow readings drift with small random noise every second.
- **Simulate Illegal Tap** starts a leak on a chosen (or random) segment;
  its downstream flow and pressure begin to drop.
- The detector compares flow between every adjacent node pair and confirms
  a tap once the mismatch stays above a noise threshold for 3 consecutive
  readings, then raises a plain-language incident brief with a detection
  latency counter.
- **Reset** clears the incident and returns the pipeline to normal so the
  demo can be run again.

All data on screen is synthetic, clearly labeled "Simulated data".
