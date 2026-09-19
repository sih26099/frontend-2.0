import { MATCH_TYPE_LABELS, MATCH_TYPE_STYLES } from '../../lib/constants'

export default function MatchTypeBadge({ matchType, className = '' }) {
  if (!matchType) return <span className="text-ink-300">—</span>
  const style = MATCH_TYPE_STYLES[matchType] || 'bg-ink-100 text-ink-700 border-ink-200'
  const label = MATCH_TYPE_LABELS[matchType] || matchType

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap ${style} ${className}`}
    >
      {label}
    </span>
  )
}
