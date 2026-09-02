// Lightweight SVG line chart — no charting library needed for two lines
// over a short rolling window.
function buildPolyline(values, width, height, min, max) {
  const range = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function MiniChart({ title, unit, upstream, downstream, alerted }) {
  const width = 300
  const height = 90
  const allValues = [...upstream, ...downstream]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const pad = (max - min) * 0.15 || 1
  const lo = min - pad
  const hi = max + pad

  const upstreamPoints = buildPolyline(upstream, width, height, lo, hi)
  const downstreamPoints = buildPolyline(downstream, width, height, lo, hi)
  const latestUpstream = upstream[upstream.length - 1]
  const latestDownstream = downstream[downstream.length - 1]

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
        <div className="flex gap-3 font-mono text-xs">
          <span className="text-cyan-300">{latestUpstream.toFixed(1)}</span>
          <span className={alerted ? 'text-red-400' : 'text-slate-400'}>{latestDownstream.toFixed(1)}</span>
          <span className="text-slate-600">{unit}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full" preserveAspectRatio="none">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1e293b" strokeWidth="1" />
        <polyline points={upstreamPoints} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline
          points={downstreamPoints}
          fill="none"
          stroke={alerted ? '#f87171' : '#94a3b8'}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default function ReadingsChart({ upstreamHistory, downstreamHistory, upstreamLabel, downstreamLabel, alerted }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Live Readings</h2>
        <p className="text-xs text-slate-500">
          <span className="text-cyan-300">{upstreamLabel}</span> vs{' '}
          <span className={alerted ? 'text-red-400' : 'text-slate-400'}>{downstreamLabel}</span> · last{' '}
          {upstreamHistory.length}s
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MiniChart
          title="Flow"
          unit="m³/h"
          upstream={upstreamHistory.map((h) => h.flow)}
          downstream={downstreamHistory.map((h) => h.flow)}
          alerted={alerted}
        />
        <MiniChart
          title="Pressure"
          unit="psi"
          upstream={upstreamHistory.map((h) => h.pressure)}
          downstream={downstreamHistory.map((h) => h.pressure)}
          alerted={alerted}
        />
      </div>
    </div>
  )
}
