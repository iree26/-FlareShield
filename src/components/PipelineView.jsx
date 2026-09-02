import { NUM_SEGMENTS, CONFIRM_TICKS } from '../lib/simulation'

function NodeCard({ index, node, isBoundaryOfDetected }) {
  const label = index === 0 ? 'Pump Station' : index === NUM_SEGMENTS ? 'Terminal' : `Node ${index + 1}`
  return (
    <div
      className={`flex w-20 shrink-0 flex-col items-center gap-0.5 rounded-lg border px-1.5 py-2 text-center transition-colors sm:w-24 ${
        isBoundaryOfDetected
          ? 'border-red-500 bg-red-950/60'
          : 'border-slate-700 bg-slate-900'
      }`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500 bg-slate-950 text-[11px] font-bold text-cyan-300">
        N{index + 1}
      </div>
      <div className="truncate text-[9px] uppercase tracking-wide text-slate-400" title={label}>
        {label}
      </div>
      <div className="font-mono text-xs text-slate-100 sm:text-sm">{node.pressure.toFixed(1)} psi</div>
      <div className="font-mono text-xs text-slate-100 sm:text-sm">{node.flow.toFixed(1)} m³/h</div>
    </div>
  )
}

function SegmentBar({ index, mismatch, suspectCount, isDetected }) {
  let colorClasses = 'bg-emerald-600'
  let ring = ''
  if (isDetected) {
    colorClasses = 'bg-red-600 animate-pulse-glow'
    ring = 'ring-2 ring-red-400'
  } else if (suspectCount > 0) {
    colorClasses = 'bg-amber-500 animate-pulse-amber'
    ring = 'ring-2 ring-amber-300'
  }

  return (
    <div className="flex min-w-8 flex-1 flex-col items-center gap-1 px-0.5">
      <div className={`h-3 w-full rounded-full ${colorClasses} ${ring} transition-colors duration-300`} />
      <div className="text-center text-[9px] leading-tight text-slate-400">Seg {index + 1}</div>
      {(suspectCount > 0 || isDetected) && (
        <div className={`whitespace-nowrap text-center text-[9px] font-mono leading-tight ${isDetected ? 'text-red-400' : 'text-amber-300'}`}>
          Δ{mismatch.toFixed(0)} {!isDetected && `(${suspectCount}/${CONFIRM_TICKS})`}
        </div>
      )}
    </div>
  )
}

export default function PipelineView({ nodes, suspectCounts, detection }) {
  const mismatches = []
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    mismatches.push(nodes[i].flow - nodes[i + 1].flow)
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Pipeline Overview</h2>
        <p className="text-xs text-slate-500">
          Each <span className="text-cyan-300">node</span> is a sensor measuring pressure &amp; flow. A{' '}
          <span className="text-amber-300">segment</span> is the pipe between two nodes — it is being tapped when the
          flow entering and leaving it stop matching.
        </p>
      </div>
      <div className="flex items-stretch overflow-x-auto pb-2">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center">
            <NodeCard
              index={i}
              node={node}
              isBoundaryOfDetected={detection != null && (i === detection.segment || i === detection.segment + 1)}
            />
            {i < NUM_SEGMENTS && (
              <SegmentBar
                index={i}
                mismatch={mismatches[i]}
                suspectCount={suspectCounts[i]}
                isDetected={detection != null && detection.segment === i}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-emerald-600" /> Normal — flow balanced
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-amber-500" /> Anomaly — confirming ({CONFIRM_TICKS} readings needed)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-red-600" /> Confirmed tap
        </span>
      </div>
    </div>
  )
}
