function Tile({ label, value, className }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3 text-center">
      <div className={`text-2xl font-bold tabular-nums sm:text-3xl ${className ?? 'text-slate-100'}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  )
}

export default function StatusSummary({ total, normal, investigating, alertCount, status }) {
  const statusClasses = {
    NORMAL: 'text-emerald-400',
    INVESTIGATING: 'text-amber-300',
    ALERT: 'text-red-400',
  }[status]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Tile label="Segments Monitored" value={total} />
      <Tile label="Normal" value={normal} className="text-emerald-400" />
      <Tile label="Investigating" value={investigating} className="text-amber-300" />
      <Tile label="Active Alerts" value={alertCount} className={alertCount > 0 ? 'text-red-400' : 'text-slate-100'} />
      <Tile label="System State" value={status} className={`text-lg sm:text-xl ${statusClasses}`} />
    </div>
  )
}
