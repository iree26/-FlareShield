import { NUM_SEGMENTS } from '../lib/simulation'

export default function ControlPanel({
  selectedSegment,
  onChangeSegment,
  onSimulateTap,
  onReset,
  tapActive,
  detection,
  elapsedSeconds,
}) {
  const status = detection ? 'ALERT' : tapActive ? 'INVESTIGATING' : 'NORMAL'
  const statusClasses = {
    NORMAL: 'text-emerald-400 border-emerald-600 bg-emerald-950/40',
    INVESTIGATING: 'text-amber-300 border-amber-600 bg-amber-950/40',
    ALERT: 'text-red-400 border-red-600 bg-red-950/40 animate-pulse',
  }[status]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="segment-select">
            Tap target
          </label>
          <select
            id="segment-select"
            value={selectedSegment}
            onChange={(e) => onChangeSegment(e.target.value)}
            disabled={tapActive}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 disabled:opacity-50"
          >
            <option value="random">Random segment</option>
            {Array.from({ length: NUM_SEGMENTS }, (_, i) => (
              <option key={i} value={i}>
                Segment {i + 1}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSimulateTap}
            disabled={tapActive}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            🚨 Simulate Illegal Tap
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            ↺ Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          {tapActive && (
            <div className="text-right font-mono text-xs text-slate-400">
              {detection ? 'Detection latency' : 'Time since tap'}
              <div className="text-lg text-slate-100">
                {(detection ? detection.latencyMs / 1000 : elapsedSeconds).toFixed(1)}s
              </div>
            </div>
          )}
          <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${statusClasses}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}
