import { fmtConfidenceValue } from '../../lib/formatters'

/**
 * Renders a value the backend actually returned as a horizontal bar plus
 * its percentage. Never fabricates a score — if value is null/undefined the
 * bar renders empty and the label shows "—".
 */
export default function ConfidenceBar({ value, label, size = 'md' }) {
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value)
  const pct = hasValue ? fmtConfidenceValue(value) : 0
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  const color =
    pct >= 90 ? 'bg-signal-good' : pct >= 75 ? 'bg-signal-info' : pct >= 55 ? 'bg-signal-pending' : 'bg-signal-bad'

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      {label && <span className="text-xs text-ink-500 w-20 shrink-0">{label}</span>}
      <div className={`flex-1 bg-ink-100 rounded-sm overflow-hidden ${height}`}>
        {hasValue && (
          <div className={`h-full rounded-sm ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        )}
      </div>
      <span className="text-xs font-mono text-ink-700 w-12 text-right shrink-0">
        {hasValue ? `${pct.toFixed(1)}%` : '—'}
      </span>
    </div>
  )
}
