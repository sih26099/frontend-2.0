import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ offset, limit, count, onOffsetChange }) {
  const page = Math.floor(offset / limit) + 1
  const hasPrev = offset > 0
  const hasNext = count === limit

  const rangeStart = count > 0 ? offset + 1 : 0
  const rangeEnd = offset + count

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-ink-100 bg-white text-xs text-ink-500">
      <span>
        {count > 0 ? (
          <>
            Showing <span className="font-medium text-ink-700">{rangeStart}–{rangeEnd}</span>
            <span className="text-ink-400"> · Page {page}</span>
          </>
        ) : (
          'No results'
        )}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={!hasPrev}
          aria-label="Previous page"
          className="p-1.5 rounded border border-ink-200 transition-all duration-150 disabled:opacity-40 hover:bg-surface-sunk hover:border-ink-300 disabled:hover:bg-white disabled:hover:border-ink-200 active:scale-95"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onOffsetChange(offset + limit)}
          disabled={!hasNext}
          aria-label="Next page"
          className="p-1.5 rounded border border-ink-200 transition-all duration-150 disabled:opacity-40 hover:bg-surface-sunk hover:border-ink-300 disabled:hover:bg-white disabled:hover:border-ink-200 active:scale-95"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}