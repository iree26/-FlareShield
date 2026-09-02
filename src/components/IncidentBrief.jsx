import { buildIncidentBrief } from '../lib/simulation'

export default function IncidentBrief({ detection }) {
  const brief = buildIncidentBrief(detection)

  if (!brief) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Incident Brief</h2>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500">
          <div className="text-3xl">🛡️</div>
          <p className="text-sm">System nominal.</p>
          <p className="text-xs">No incidents detected. A confirmed tap will generate a live alert here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-xl border-2 border-red-600 bg-red-950/30 p-4 shadow-lg shadow-red-950/50">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-red-300">⚠ Incident Brief</h2>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${brief.severity.className}`}>
          {brief.severity.label}
        </span>
      </div>

      <h3 className="mb-1 text-base font-bold text-white">{brief.title}</h3>
      <p className="mb-3 text-xs text-slate-400">Detected at {brief.timestamp} · Latency {brief.latencySeconds}s</p>

      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">Estimated Location</p>
        <p className="text-sm text-slate-100">{brief.location}</p>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Evidence</p>
        <ul className="space-y-1 text-sm text-slate-200">
          {brief.evidenceLines.map((line, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-red-400">•</span>
              <span className="font-mono text-xs leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto rounded-lg border border-red-700 bg-red-900/40 p-3">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-red-300">Recommended Action</p>
        <p className="text-sm text-slate-100">{brief.recommendedAction}</p>
      </div>
    </div>
  )
}
