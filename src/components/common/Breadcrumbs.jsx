import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * items: [{ label, to? }] — the last item (or any item without `to`) renders
 * as plain text (current page); everything else is a link.
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-ink-400 flex-wrap" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-ink-300" />}
            {isLast || !item.to ? (
              <span className={isLast ? 'text-ink-600 font-medium' : ''}>{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-ink-700 hover:underline">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
