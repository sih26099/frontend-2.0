import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ offset, limit, count, onOffsetChange }) {
  const page = Math.floor(offset / limit) + 1
  const hasPrev = offset > 0
  // We don't get a total count from the backend, so "next" is enabled
  // whenever the current page came back full (a partial page implies the end).
  const hasNext = count === limit

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-ink-100 bg-white text-xs text-ink-500">
      <span>Page {page}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={!hasPrev}
          aria-label="Previous page"
          className="p-1.5 rounded border border-ink-200 disabled:opacity-40 hover:bg-surface-sunk disabled:hover:bg-white"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onOffsetChange(offset + limit)}
          disabled={!hasNext}
          aria-label="Next page"
          className="p-1.5 rounded border border-ink-200 disabled:opacity-40 hover:bg-surface-sunk disabled:hover:bg-white"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
