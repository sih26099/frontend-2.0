import { useEffect, useState } from 'react'
import { fmtConfidenceValue } from '../../lib/formatters'

export default function ConfidenceBar({ value, label, size = 'md' }) {
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value)
  const pct = hasValue ? fmtConfidenceValue(value) : 0
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  const [animatedPct, setAnimatedPct] = useState(0)

  useEffect(() => {
    if (!hasValue) {
      setAnimatedPct(0)
      return
    }
    setAnimatedPct(0)
    const raf = requestAnimationFrame(() => setAnimatedPct(pct))
    return () => cancelAnimationFrame(raf)
  }, [hasValue, pct])

  const color =
    pct >= 90 ? 'bg-signal-good' : pct >= 75 ? 'bg-signal-info' : pct >= 55 ? 'bg-signal-pending' : 'bg-signal-bad'

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      {label && <span className="text-xs text-ink-500 w-20 shrink-0">{label}</span>}
      <div className={`flex-1 bg-ink-100 rounded-sm overflow-hidden ${height}`}>
        {hasValue && (
          <div
            className={`h-full rounded-sm ${color} transition-all duration-700 ease-premium`}
            style={{ width: `${Math.min(animatedPct, 100)}%` }}
          />
        )}
      </div>
      <span className="text-xs font-mono text-ink-700 w-12 text-right shrink-0">
        {hasValue ? `${pct.toFixed(1)}%` : '—'}
      </span>
    </div>
  )
}