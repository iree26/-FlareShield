import { NUM_SEGMENTS, CONFIRM_TICKS } from '../lib/simulation'

// Layout constants — keep the readout / pipe / label bands the same height
// on both nodes and segments so the pipe stays visually centred on the
// node flanges no matter how the row wraps.
const READOUT_H = 64
const MID_H = 92
const LABEL_H = 44

// --- Tuning knobs for the live-demo visuals -------------------------------
// Turn these up if the effect looks too subtle on a projector; a live
// audience reads "slightly exaggerated" better than "physically accurate".
const LEAK_DROP_COUNT = { suspect: 3, confirmed: 6 }
const LEAK_MARKER_SIZE = { suspect: 11, confirmed: 18 }
const FLOW_REFERENCE = 480 // m3/h — flow at which the dot animation runs at its base speed
// ---------------------------------------------------------------------------

function flowSpeedSeconds(flow) {
  // Faster visual flow when throughput is high, slower (sluggish) once a
  // leak has drained a downstream segment. Clamped so it never freezes or
  // spins unreasonably fast.
  const ratio = FLOW_REFERENCE / Math.max(flow, 40)
  return Math.min(4, Math.max(0.7, 1.4 * ratio))
}

function LeakEffect({ severity }) {
  const isConfirmed = severity === 'confirmed'
  const dropCount = LEAK_DROP_COUNT[severity]
  const markerSize = LEAK_MARKER_SIZE[severity]
  const color = isConfirmed ? '#f87171' : '#fbbf24'

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2"
      style={{ '--leak-drop-color': color }}
    >
      {/* diverted stub pipe carrying the stolen fluid away */}
      <div
        className="absolute left-1/2 top-0 h-6 w-2.5 origin-top -translate-x-1/2 rounded-b-full"
        style={{
          transform: 'translateX(-50%) rotate(24deg)',
          background: `linear-gradient(to bottom, ${color}cc, ${color}22)`,
          boxShadow: `0 0 10px ${color}99`,
        }}
      />
      <div
        className="leak-marker absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
        style={{ width: markerSize, height: markerSize, background: color }}
      />
      {Array.from({ length: dropCount }).map((_, i) => (
        <span key={i} className="leak-drop" style={{ animationDelay: `${i * 0.16}s`, marginLeft: (i % 3) * 5 - 5 }} />
      ))}
      <div
        className={`absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          isConfirmed
            ? 'border-red-500 bg-red-950/90 text-red-300'
            : 'border-amber-500 bg-amber-950/90 text-amber-300'
        }`}
      >
        {isConfirmed ? 'Tap confirmed' : 'Checking anomaly'}
      </div>
    </div>
  )
}

function NodeColumn({ index, node, isBoundaryOfDetected }) {
  const label = index === 0 ? 'Pump Station' : index === NUM_SEGMENTS ? 'Terminal' : `Node ${index + 1}`
  const highlight = isBoundaryOfDetected

  return (
    <div className="flex w-[72px] shrink-0 flex-col items-center sm:w-20">
      <div className="flex flex-col items-center justify-end" style={{ height: READOUT_H }}>
        <div className={`font-mono text-sm font-semibold sm:text-base ${highlight ? 'text-red-300' : 'text-slate-100'}`}>
          {node.pressure.toFixed(0)}
          <span className="text-[10px] font-normal text-slate-500"> psi</span>
        </div>
        <div className={`font-mono text-sm font-semibold sm:text-base ${highlight ? 'text-red-300' : 'text-cyan-200'}`}>
          {node.flow.toFixed(0)}
          <span className="text-[10px] font-normal text-slate-500"> m³/h</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center" style={{ height: MID_H }}>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg sm:h-16 sm:w-16 sm:text-sm ${
            highlight
              ? 'border-red-400 bg-red-950 text-red-200 shadow-red-900/70'
              : 'border-cyan-500 bg-slate-950 text-cyan-300 shadow-black/70'
          }`}
        >
          N{index + 1}
        </div>
      </div>

      <div className="flex flex-col items-center justify-start text-center" style={{ height: LABEL_H }}>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      </div>
    </div>
  )
}

function SegmentColumn({ index, mismatch, suspectCount, isDetected, isArmed, flow }) {
  const isFirst = index === 0
  const isLast = index === NUM_SEGMENTS - 1
  const endCapClasses = `${isFirst ? 'rounded-l-full' : ''} ${isLast ? 'rounded-r-full' : ''}`

  let fluidClasses = 'bg-gradient-to-b from-emerald-400 to-emerald-600'
  let dotColor = '#065f46'
  if (isDetected) {
    fluidClasses = 'bg-gradient-to-b from-red-400 to-red-600 animate-pulse-glow'
    dotColor = '#7f1d1d'
  } else if (suspectCount > 0) {
    fluidClasses = 'bg-gradient-to-b from-amber-400 to-amber-600 animate-pulse-amber'
    dotColor = '#78350f'
  }

  const showLeak = isDetected || suspectCount > 0

  return (
    <div className="relative flex flex-1 flex-col items-stretch" style={{ minWidth: 24 }}>
      <div style={{ height: READOUT_H }} />

      <div className="relative flex items-center" style={{ height: MID_H }}>
        {/* outer casing — reads as one continuous steel pipe across all segments */}
        <div
          className={`relative h-11 w-full bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-[inset_0_2px_2px_rgba(255,255,255,0.15),inset_0_-2px_3px_rgba(0,0,0,0.5)] sm:h-[52px] ${endCapClasses} ${
            isArmed ? 'outline outline-2 outline-offset-2 outline-dashed outline-cyan-300/80' : ''
          }`}
        >
          {/* fluid window showing the state colour + moving flow marks */}
          <div className={`absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 overflow-hidden sm:h-7 ${endCapClasses} ${fluidClasses}`}>
            <div
              className="flow-layer h-full w-full opacity-90"
              style={{ '--flow-dot-color': dotColor, animationDuration: `${flowSpeedSeconds(flow)}s` }}
            />
          </div>
        </div>
        {showLeak && <LeakEffect severity={isDetected ? 'confirmed' : 'suspect'} />}
      </div>

      <div className="flex flex-col items-center justify-start text-center" style={{ height: LABEL_H }}>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Segment {index + 1}</span>
        {(suspectCount > 0 || isDetected) && (
          <span className={`font-mono text-[10px] ${isDetected ? 'text-red-400' : 'text-amber-300'}`}>
            Δ{mismatch.toFixed(0)} m³/h {!isDetected && `(${suspectCount}/${CONFIRM_TICKS})`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function PipelineHero({ nodes, suspectCounts, detection, armedSegment, tapActive }) {
  const mismatches = []
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    mismatches.push(nodes[i].flow - nodes[i + 1].flow)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5 shadow-xl shadow-black/40 sm:p-8">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold uppercase tracking-wide text-slate-200">Pipeline Overview</h2>
        <p className="text-xs text-slate-500">
          <span className="text-cyan-300">Nodes</span> measure pressure &amp; flow ·{' '}
          <span className="text-amber-300">segments</span> are tapped when flow in ≠ flow out
        </p>
      </div>

      <div className="mt-6 flex items-stretch overflow-x-auto pb-16">
        {nodes.flatMap((node, i) => {
          const elements = [
            <NodeColumn
              key={`node-${i}`}
              index={i}
              node={node}
              isBoundaryOfDetected={detection != null && (i === detection.segment || i === detection.segment + 1)}
            />,
          ]
          if (i < NUM_SEGMENTS) {
            elements.push(
              <SegmentColumn
                key={`segment-${i}`}
                index={i}
                mismatch={mismatches[i]}
                suspectCount={suspectCounts[i]}
                isDetected={detection != null && detection.segment === i}
                isArmed={!tapActive && armedSegment === i}
                flow={Math.min(nodes[i].flow, nodes[i + 1].flow)}
              />,
            )
          }
          return elements
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-emerald-500" /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-amber-500" /> Confirming ({CONFIRM_TICKS} readings)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-red-500" /> Confirmed tap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full border border-dashed border-cyan-300" /> Selected tap target
        </span>
      </div>
    </div>
  )
}
