import { Loader2 } from 'lucide-react'
import { TableSkeleton } from './Skeleton'

/**
 * variant="spinner" (default): centered spinner + label -- used on detail
 * pages and anywhere a table shape doesn't apply.
 * variant="table": renders skeleton rows shaped like `.data-table`, so
 * table-heavy list pages keep their layout stable while loading instead of
 * collapsing to a centered spinner.
 */
export default function LoadingState({ label = 'Loading…', compact = false, variant = 'spinner', columns = 5, rows = 6 }) {
  if (variant === 'table') {
    return <TableSkeleton columns={columns} rows={rows} />
  }

  return (
    <div className={`flex items-center justify-center gap-2 text-ink-500 ${compact ? 'py-6' : 'py-16'}`}>
      <Loader2 size={16} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
