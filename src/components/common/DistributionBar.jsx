export default function DistributionBar({ rows, colorFor }) {
  const total = rows.reduce((sum, r) => sum + (r.value || 0), 0)

  if (total === 0) {
    return <div className="text-sm text-ink-400 py-4 text-center">No data yet.</div>
  }

  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const pct = total > 0 ? (row.value / total) * 100 : 0
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-ink-700">{row.label}</span>
              <span className="font-mono text-ink-500">{row.value}</span>
            </div>
            <div className="h-1.5 bg-ink-100 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm"
                style={{ width: `${pct}%`, backgroundColor: colorFor ? colorFor(row.label) : '#1D4E89' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
