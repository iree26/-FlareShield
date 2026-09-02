const BAR_COLORS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-500',
}

function RiskRow({ rank, row, onSelectSegment }) {
  const { segment, score, level, reason, isDetected, isInvestigating } = row

  return (
    <button
      type="button"
      onClick={() => onSelectSegment(segment)}
      className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors hover:border-cyan-700/60 hover:bg-slate-900/80 ${
        isDetected ? 'border-red-700/70 bg-red-950/30' : 'border-slate-800 bg-slate-950/60'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm font-bold text-slate-300">
        {rank}
      </div>

      <div className="w-24 shrink-0">
        <div className="text-sm font-semibold text-slate-100">Segment {segment + 1}</div>
        {isDetected && <div className="text-[10px] font-bold uppercase tracking-wide text-red-400">Active tap</div>}
        {isInvestigating && <div className="text-[10px] font-bold uppercase tracking-wide text-amber-300">Investigating</div>}
      </div>

      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full rounded-full ${BAR_COLORS[level.label]} transition-all duration-500`} style={{ width: `${score}%` }} />
        </div>
        <p className="mt-1.5 text-xs leading-snug text-slate-500">{reason}</p>
      </div>

      <div className="w-16 shrink-0 text-right">
        <div className="font-mono text-xl font-bold tabular-nums text-slate-100">{score}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">/ 100</div>
      </div>

      <span className={`w-20 shrink-0 rounded-full border px-2 py-1 text-center text-[10px] font-bold tracking-wide ${level.className}`}>
        {level.label}
      </span>
    </button>
  )
}

export default function RiskRanking({ ranking, onSelectSegment }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl shadow-black/40 sm:p-8">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold uppercase tracking-wide text-slate-200">Segment Risk Ranking</h2>
        <p className="text-xs text-slate-500">Prioritise patrols by combined incident history, access, and live status</p>
      </div>
      <p className="mb-5 text-xs text-slate-600">
        Historical incident counts and access-road distances shown here are{' '}
        <span className="text-cyan-300">simulated for demonstration</span>, not real field records. Click a row to jump
        to that segment on the Live Monitor.
      </p>

      <div className="flex flex-col gap-2">
        {ranking.map((row, i) => (
          <RiskRow key={row.segment} rank={i + 1} row={row} onSelectSegment={onSelectSegment} />
        ))}
      </div>
    </div>
  )
}
