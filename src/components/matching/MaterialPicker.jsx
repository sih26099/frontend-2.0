import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { listMaterials } from '../../services/api'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fmt } from '../../lib/formatters'

export default function MaterialPicker({ label, selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounced = useDebouncedValue(query, 300)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    listMaterials({ limit: 20, cpse: undefined })
      .then((res) => {
        const term = debounced.trim().toLowerCase()
        const filtered = term
          ? res.data.filter(
              (m) =>
                (m.material_description || '').toLowerCase().includes(term) ||
                (m.existing_material_code || '').toLowerCase().includes(term) ||
                (m.source_cpse || '').toLowerCase().includes(term)
            )
          : res.data
        setOptions(filtered)
      })
      .finally(() => setLoading(false))
  }, [debounced, open])

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-ink-500 mb-1">{label}</label>
      {selected ? (
        <div className="flex items-center justify-between gap-2 border border-ink-200 rounded px-3 py-2 bg-surface-sunk">
          <div className="min-w-0">
            <div className="text-sm text-ink-900 truncate">
              {selected.standardized_description || selected.material_description}
            </div>
            <div className="text-xs text-ink-500 font-mono">
              {selected.source_cpse} · {selected.existing_material_code}
            </div>
          </div>
          <button onClick={() => onSelect(null)} aria-label="Clear selection" className="text-ink-400 hover:text-ink-700 shrink-0">
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search by description, code, or CPSE"
            className="w-full text-sm border border-ink-200 rounded pl-8 pr-3 py-2 placeholder:text-ink-300"
          />
        </div>
      )}

      {open && !selected && (
        <div className="absolute z-20 mt-1 w-full card-surface bg-white border border-ink-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {loading && <div className="px-3 py-3 text-sm text-ink-400">Loading…</div>}
          {!loading && options.length === 0 && (
            <div className="px-3 py-3 text-sm text-ink-400">No materials found.</div>
          )}
          {!loading &&
            options.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m)
                  setOpen(false)
                  setQuery('')
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-sunk border-b border-ink-100 last:border-0"
              >
                <div className="text-sm text-ink-900 truncate">
                  {fmt(m.standardized_description || m.material_description)}
                </div>
                <div className="text-xs text-ink-500 font-mono">
                  {m.source_cpse} · {m.existing_material_code}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
