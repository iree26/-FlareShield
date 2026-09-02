// Pure simulation + detection logic for FlareShield.
// Kept separate from components so the "physics" and the detection
// algorithm can be read/audited independently of the UI.

export const NUM_NODES = 7
export const NUM_SEGMENTS = NUM_NODES - 1
export const PIPELINE_LENGTH_KM = 18
export const SEGMENT_LENGTH_KM = PIPELINE_LENGTH_KM / NUM_SEGMENTS

export const TICK_MS = 1000

// Baseline physical model (all units are illustrative, not real crude-oil specs)
const PRESSURE_START = 960 // psi at the pump station (Node 1)
const PRESSURE_DROP_PER_SEGMENT = 9 // natural friction loss per segment
const BASE_FLOW = 480 // m3/h under normal operation, same at every node

// Sensor noise / random-walk behaviour (keeps the readout looking "alive")
const PRESSURE_STEP = 1.4
const PRESSURE_DEVIATION = 5
const FLOW_STEP = 2.2
const FLOW_DEVIATION = 6

// Tap (illegal siphoning) behaviour
const LEAK_RAMP_MS = 6000 // time for the thief to fully open the tap valve
const MAX_LEAK = 150 // m3/h once fully open
const PRESSURE_LEAK_FACTOR = 0.55 // psi lost downstream per unit of leak

// Detection tuning
export const MISMATCH_THRESHOLD = 18 // m3/h — above normal noise band
export const CONFIRM_TICKS = 3 // consecutive over-threshold readings required

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(value * 10) / 10
}

// Mean-reverting random walk: nudges the previous reading toward the
// current baseline while adding a little noise, so values drift smoothly
// instead of jumping randomly every tick.
function stepValue(prev, baseline, step, deviation) {
  const noisy = prev + (Math.random() * 2 - 1) * step
  const pulled = noisy + (baseline - noisy) * 0.12
  return clamp(pulled, baseline - deviation, baseline + deviation)
}

export function createInitialState() {
  const nodes = Array.from({ length: NUM_NODES }, (_, i) => ({
    pressure: PRESSURE_START - i * PRESSURE_DROP_PER_SEGMENT,
    flow: BASE_FLOW,
  }))
  return {
    nodes,
    tap: null, // { segment, startTime }
    suspectCounts: Array(NUM_SEGMENTS).fill(0),
    detection: null, // { segment, time, latencyMs, evidence }
  }
}

export function startTap(state, segment, now) {
  return {
    ...state,
    tap: { segment, startTime: now },
    suspectCounts: Array(NUM_SEGMENTS).fill(0),
    detection: null,
  }
}

export function resetSimulation() {
  return createInitialState()
}

/**
 * Advance the simulation by one tick.
 *
 * DETECTION PRINCIPLE — MASS BALANCE:
 * Under normal operation, the flow measured entering a segment (its
 * upstream node) must equal the flow measured leaving it (its downstream
 * node), within sensor noise. A tap removes fluid from inside a segment,
 * so it holds the upstream reading steady while the downstream reading
 * drops — the two readings stop balancing. We watch the mismatch between
 * every adjacent node pair, and only confirm a tap once that mismatch has
 * stayed above a noise-tolerant threshold for several readings in a row,
 * so a single noisy sample can never trigger a false alert.
 */
export function stepSimulation(state, now) {
  const { nodes, tap, suspectCounts, detection } = state

  let leak = 0
  if (tap) {
    const elapsed = now - tap.startTime
    leak = clamp((elapsed / LEAK_RAMP_MS) * MAX_LEAK, 0, MAX_LEAK)
  }

  const newNodes = nodes.map((node, i) => {
    const downstreamOfTap = tap != null && i > tap.segment
    const baselinePressure =
      PRESSURE_START - i * PRESSURE_DROP_PER_SEGMENT - (downstreamOfTap ? leak * PRESSURE_LEAK_FACTOR : 0)
    const baselineFlow = BASE_FLOW - (downstreamOfTap ? leak : 0)
    return {
      pressure: round1(stepValue(node.pressure, baselinePressure, PRESSURE_STEP, PRESSURE_DEVIATION)),
      flow: round1(stepValue(node.flow, baselineFlow, FLOW_STEP, FLOW_DEVIATION)),
    }
  })

  const mismatches = []
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    mismatches.push(round1(newNodes[i].flow - newNodes[i + 1].flow))
  }

  if (detection) {
    // Already confirmed — hold state until the operator resets.
    return { nodes: newNodes, tap, suspectCounts, detection }
  }

  const newSuspectCounts = mismatches.map((m, i) => (m > MISMATCH_THRESHOLD ? suspectCounts[i] + 1 : 0))

  let newDetection = null
  const confirmedSegment = newSuspectCounts.findIndex((c) => c >= CONFIRM_TICKS)
  if (confirmedSegment !== -1 && tap) {
    newDetection = {
      segment: confirmedSegment,
      time: now,
      latencyMs: now - tap.startTime,
      evidence: {
        upstream: { ...newNodes[confirmedSegment] },
        downstream: { ...newNodes[confirmedSegment + 1] },
        mismatch: mismatches[confirmedSegment],
      },
    }
  }

  return { nodes: newNodes, tap, suspectCounts: newSuspectCounts, detection: newDetection }
}

export function severityFor(mismatch) {
  const pct = (mismatch / BASE_FLOW) * 100
  if (pct >= 20) return { label: 'CRITICAL', className: 'text-red-400 border-red-500 bg-red-950/60' }
  if (pct >= 10) return { label: 'HIGH', className: 'text-orange-300 border-orange-500 bg-orange-950/60' }
  if (pct >= 5) return { label: 'MODERATE', className: 'text-amber-300 border-amber-500 bg-amber-950/50' }
  return { label: 'LOW', className: 'text-yellow-300 border-yellow-500 bg-yellow-950/50' }
}

export function segmentLocation(segment) {
  const startKm = segment * SEGMENT_LENGTH_KM
  const endKm = startKm + SEGMENT_LENGTH_KM
  const midKm = (startKm + endKm) / 2
  return { startKm, endKm, midKm }
}

export function buildIncidentBrief(detection) {
  if (!detection) return null
  const { segment, latencyMs, evidence } = detection
  const { midKm, startKm, endKm } = segmentLocation(segment)
  const severity = severityFor(evidence.mismatch)
  const upstreamNode = segment + 1
  const downstreamNode = segment + 2

  return {
    title: `Illegal Tap Confirmed — Segment ${segment + 1}`,
    severity,
    segmentLabel: `Segment ${segment + 1}`,
    location: `Approx. ${midKm.toFixed(1)} km from Pump Station (between km ${startKm.toFixed(1)} and km ${endKm.toFixed(1)}), between Node ${upstreamNode} and Node ${downstreamNode}.`,
    latencySeconds: (latencyMs / 1000).toFixed(1),
    evidenceLines: [
      `Node ${upstreamNode} (upstream) flow: ${evidence.upstream.flow.toFixed(1)} m³/h — normal.`,
      `Node ${downstreamNode} (downstream) flow: ${evidence.downstream.flow.toFixed(1)} m³/h — ${evidence.mismatch.toFixed(1)} m³/h below upstream.`,
      `Pressure differential: Node ${upstreamNode} ${evidence.upstream.pressure.toFixed(1)} psi vs Node ${downstreamNode} ${evidence.downstream.pressure.toFixed(1)} psi.`,
      `Estimated product loss rate: ${evidence.mismatch.toFixed(1)} m³/h.`,
    ],
    recommendedAction: `Dispatch nearest response team to the pipeline right-of-way near km ${midKm.toFixed(1)}. Isolate Segment ${segment + 1} at the nearest block valves, notify the control room supervisor, and inspect between Node ${upstreamNode} and Node ${downstreamNode} for tampering.`,
    timestamp: new Date(detection.time).toLocaleTimeString(),
  }
}
