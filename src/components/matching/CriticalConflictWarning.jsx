import { AlertTriangle } from 'lucide-react'
import { titleCase, fmt } from '../../lib/formatters'

/**
 * conflicts: list of attribute names from MatchCandidateOut.critical_conflicts
 * comparisons: optional attribute_comparisons list (from evidence JSON) used
 * to show the actual conflicting values, when available.
 */
export default function CriticalConflictWarning({ conflicts, comparisons = [] }) {
  if (!conflicts || conflicts.length === 0) return null

  const byAttribute = Object.fromEntries((comparisons || []).map((c) => [c.attribute, c]))

  return (
    <div className="bg-signal-conflictBg border border-signal-conflict/40 rounded-md p-4">
      <div className="flex items-center gap-2 text-signal-conflict font-semibold text-sm">
        <AlertTriangle size={16} />
        Critical technical conflict
      </div>
      <p className="text-sm text-signal-conflict/90 mt-1">
        This match cannot be treated as an exact or near duplicate.
      </p>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {conflicts.map((attr) => {
          const comp = byAttribute[attr]
          return (
            <div key={attr} className="bg-white/60 border border-signal-conflict/25 rounded px-3 py-2">
              <div className="text-xs font-medium text-ink-900">{titleCase(attr)}</div>
              {comp ? (
                <div className="text-xs text-ink-700 mt-1 space-y-0.5">
                  <div>Material A: <span className="font-mono">{fmt(comp.value_a)}</span></div>
                  <div>Material B: <span className="font-mono">{fmt(comp.value_b)}</span></div>
                </div>
              ) : (
                <div className="text-xs text-ink-500 mt-1">Values conflict between the two materials.</div>
              )}
              <div className="text-[0.65rem] text-signal-conflict font-medium mt-1">CONFLICT</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
