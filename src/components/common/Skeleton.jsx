/** A single shimmering placeholder bar/box. Pass width/height via className. */
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

/**
 * Renders `rows` skeleton rows inside a <table> shaped like `.data-table`,
 * with `columns` cells each. Drop-in replacement for a spinner while a
 * table-heavy page's data is loading -- keeps the page's layout stable
 * instead of collapsing to a centered spinner.
 */
export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <table className="data-table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c}>
                <SkeletonBlock className={`h-3.5 ${c === 0 ? 'w-24' : 'w-16'}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Skeleton for a grid of stat/summary cards (Dashboard, Sync connectors). */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-ink-200 rounded-md p-3.5 space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-5 w-28" />
        </div>
      ))}
    </div>
  )
}
