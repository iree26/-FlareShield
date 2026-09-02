/*
 * FlareShield — Pipeline Theft Detection Demo
 *
 * DETECTION PRINCIPLE — MASS BALANCE:
 * Sensor nodes sit at regular intervals along the pipeline, each measuring
 * local pressure and flow. Under normal operation, the flow measured
 * entering any segment (its upstream node) equals the flow measured
 * leaving it (its downstream node), within ordinary sensor noise.
 *
 * An illegal tap removes fluid from inside a segment. That breaks the
 * balance: the upstream node keeps reading normal flow while the
 * downstream node reads less, and pressure downstream of the tap sags.
 * FlareShield continuously compares flow between every adjacent node
 * pair. Only when that mismatch stays above a noise-tolerant threshold
 * for several consecutive readings in a row (ruling out a single noisy
 * sample) does it confirm a tap on that exact segment and raise an alert.
 *
 * Everything here — sensor readings, the tap, and detection — is
 * simulated entirely in the browser. See src/lib/simulation.js for the
 * model and detection logic, kept separate from this UI layer.
 */
import { useEffect, useRef, useState } from 'react'
import PipelineHero from './components/PipelineHero'
import ControlPanel from './components/ControlPanel'
import StatusSummary from './components/StatusSummary'
import ReadingsChart from './components/ReadingsChart'
import IncidentBrief from './components/IncidentBrief'
import { createInitialState, resetSimulation, startTap, stepSimulation, TICK_MS, NUM_SEGMENTS } from './lib/simulation'

export default function App() {
  const [state, setState] = useState(createInitialState)
  const [selectedSegment, setSelectedSegment] = useState('random')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const tapStartRef = useRef(null)

  // Main simulation loop: one detection cycle per tick.
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => stepSimulation(prev, Date.now()))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Fast local timer just for the on-screen "time since tap" readout.
  useEffect(() => {
    tapStartRef.current = state.tap ? state.tap.startTime : null
    if (!state.tap || state.detection) return undefined
    const id = setInterval(() => {
      if (tapStartRef.current) {
        setElapsedSeconds((Date.now() - tapStartRef.current) / 1000)
      }
    }, 100)
    return () => clearInterval(id)
  }, [state.tap, state.detection])

  const handleSimulateTap = () => {
    const segment =
      selectedSegment === 'random' ? Math.floor(Math.random() * NUM_SEGMENTS) : Number(selectedSegment)
    setElapsedSeconds(0)
    setState((prev) => startTap(prev, segment, Date.now()))
  }

  const handleReset = () => {
    setElapsedSeconds(0)
    setState(resetSimulation())
  }

  const armedSegment = selectedSegment === 'random' ? null : Number(selectedSegment)
  const chartSegment = state.detection ? state.detection.segment : armedSegment ?? 0
  const investigatingCount = state.detection ? 0 : state.suspectCounts.filter((c) => c > 0).length
  const alertCount = state.detection ? 1 : 0
  const normalCount = NUM_SEGMENTS - investigatingCount - alertCount
  const systemStatus = state.detection ? 'ALERT' : state.tap ? 'INVESTIGATING' : 'NORMAL'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className={`alert-vignette ${state.detection ? 'is-active' : ''}`} />

      <header
        className={`sticky top-0 z-30 border-b px-6 py-4 backdrop-blur transition-colors duration-500 ${
          state.detection ? 'border-red-800/60 bg-slate-950/95' : 'border-slate-800 bg-slate-950/90'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              🛡️ Flare<span className="text-cyan-400">Shield</span>
            </h1>
            <p className="text-xs text-slate-400">Pipeline Theft Detection System — Live Demonstration</p>
          </div>
          <span className="rounded-full border border-cyan-700 bg-cyan-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            ● Simulated data
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
        <ControlPanel
          selectedSegment={selectedSegment}
          onChangeSegment={setSelectedSegment}
          onSimulateTap={handleSimulateTap}
          onReset={handleReset}
          tapActive={state.tap != null}
          detection={state.detection}
          elapsedSeconds={elapsedSeconds}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-start">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <PipelineHero
              nodes={state.nodes}
              suspectCounts={state.suspectCounts}
              detection={state.detection}
              armedSegment={armedSegment}
              tapActive={state.tap != null}
            />

            <StatusSummary
              total={NUM_SEGMENTS}
              normal={normalCount}
              investigating={investigatingCount}
              alertCount={alertCount}
              status={systemStatus}
            />

            <ReadingsChart
              upstreamHistory={state.history[chartSegment]}
              downstreamHistory={state.history[chartSegment + 1]}
              upstreamLabel={`Node ${chartSegment + 1}`}
              downstreamLabel={`Node ${chartSegment + 2}`}
              alerted={state.detection != null && state.detection.segment === chartSegment}
            />

            <p className="rounded-lg border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-400">How to read this:</strong> each node reports live pressure and
              flow. Click <em>Simulate Illegal Tap</em> to remove fluid from a segment — watch fluid visibly divert
              at the tap point while its downstream flow drops. The segment glows amber while FlareShield confirms
              the anomaly across several readings (to ignore normal sensor noise), then turns red once the tap is
              confirmed and the incident brief on the right fires.
            </p>
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
            <IncidentBrief detection={state.detection} />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-6 text-center text-[11px] text-slate-600">
        All sensor readings on this screen are synthetically generated in-browser for demonstration purposes only —
        no live field data, no network connection, no persistence.
      </footer>
    </div>
  )
}
