// Risk-ranking model for FlareShield's patrol-prioritization tab.
//
// This scores each segment on how likely it is to be targeted, combining
// two static (synthetic, seeded) factors that a real operator would know
// ahead of time — historical incident count and distance to the nearest
// access road — with a live factor read straight from the running
// simulation, so a segment currently under investigation or confirmed
// tapped jumps in rank immediately, same as it would in the field.
import { NUM_SEGMENTS } from './simulation'

// Static, illustrative per-segment history — NOT real data. Distances are
// "how close is a road/vehicle track to this stretch of pipe", the classic
// real-world predictor of where illegal taps happen.
export const SEGMENT_RISK_PROFILES = [
  { incidents: 4, accessRoadKm: 0.3 },
  { incidents: 1, accessRoadKm: 2.1 },
  { incidents: 2, accessRoadKm: 1.2 },
  { incidents: 0, accessRoadKm: 4.5 },
  { incidents: 3, accessRoadKm: 0.8 },
  { incidents: 1, accessRoadKm: 3.0 },
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function computeRiskScore(segment, suspectCount, isDetected) {
  const profile = SEGMENT_RISK_PROFILES[segment]
  const incidentScore = clamp(profile.incidents * 10, 0, 40)
  const proximityScore = clamp(30 - profile.accessRoadKm * 6, 0, 30)
  let liveScore = 0
  if (isDetected) liveScore = 30
  else if (suspectCount > 0) liveScore = 15

  return {
    total: Math.round(clamp(incidentScore + proximityScore + liveScore, 0, 100)),
    incidentScore,
    proximityScore,
    liveScore,
    profile,
  }
}

export function riskLevelFor(score) {
  if (score >= 76) return { label: 'CRITICAL', className: 'text-red-400 border-red-500 bg-red-950/60' }
  if (score >= 51) return { label: 'HIGH', className: 'text-orange-300 border-orange-500 bg-orange-950/60' }
  if (score >= 26) return { label: 'MEDIUM', className: 'text-amber-300 border-amber-500 bg-amber-950/50' }
  return { label: 'LOW', className: 'text-emerald-300 border-emerald-600 bg-emerald-950/40' }
}

export function buildRiskReason({ profile, isDetected, suspectCount }) {
  const parts = [
    `Access road ${profile.accessRoadKm.toFixed(1)} km away`,
    profile.incidents === 0 ? 'no prior incidents on record' : `${profile.incidents} prior incident${profile.incidents === 1 ? '' : 's'}`,
  ]
  if (isDetected) parts.push('ACTIVE TAP CONFIRMED')
  else if (suspectCount > 0) parts.push('currently under investigation')
  return parts.join(' · ')
}

export function buildRiskRanking(state) {
  const rows = []
  for (let segment = 0; segment < NUM_SEGMENTS; segment++) {
    const suspectCount = state.suspectCounts[segment]
    const isDetected = state.detection != null && state.detection.segment === segment
    const score = computeRiskScore(segment, suspectCount, isDetected)
    rows.push({
      segment,
      score: score.total,
      breakdown: score,
      level: riskLevelFor(score.total),
      reason: buildRiskReason({ profile: score.profile, isDetected, suspectCount }),
      isDetected,
      isInvestigating: !isDetected && suspectCount > 0,
    })
  }
  return rows.sort((a, b) => b.score - a.score)
}
