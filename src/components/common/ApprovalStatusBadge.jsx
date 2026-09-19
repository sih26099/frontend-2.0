import { APPROVAL_STATUS_STYLES } from '../../lib/constants'
import { titleCase } from '../../lib/formatters'

export default function ApprovalStatusBadge({ status, className = '' }) {
  if (!status) return <span className="text-ink-300">—</span>
  const style = APPROVAL_STATUS_STYLES[status] || 'bg-ink-100 text-ink-700 border-ink-200'

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap ${style} ${className}`}
    >
      {titleCase(status)}
    </span>
  )
}
