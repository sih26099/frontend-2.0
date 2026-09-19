import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2 } from 'lucide-react'
import { searchMaterialsSemantic } from '../../services/api'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fmt } from '../../lib/formatters'

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebouncedValue(query, 350)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10)
    if (!open) {
      setQuery('')
      setResults([])
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open || debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    searchMaterialsSemantic({ q: debouncedQuery.trim(), limit: 8, signal: controller.signal })
      .then((res) => setResults(res.data))
      .catch((err) => {
        if (err?.original?.code === 'ERR_CANCELED') return
        setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [debouncedQuery, open])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-navy-950/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-white rounded-md border border-ink-200 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
          <Search size={16} className="text-ink-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Semantic search — e.g. 15mm CPVC ball valve socket"
            className="flex-1 text-sm outline-none placeholder:text-ink-300"
            aria-label="Search materials"
          />
          {loading && <Loader2 size={14} className="animate-spin text-ink-400" />}
          <button onClick={onClose} aria-label="Close search" className="text-ink-400 hover:text-ink-700">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {error && <div className="px-4 py-4 text-sm text-signal-bad">{error}</div>}

          {!error && debouncedQuery.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-ink-500">No matching materials found.</div>
          )}

          {!error && debouncedQuery.trim().length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-ink-400">
              Type at least 2 characters to search across all standardized material descriptions.
            </div>
          )}

          {results.map((r) => (
            <button
              key={r.material.id}
              onClick={() => {
                navigate(`/materials/${r.material.id}`)
                onClose()
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-surface-sunk border-b border-ink-100 last:border-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-900 truncate">
                  {fmt(r.material.standardized_description || r.material.material_description)}
                </span>
                <span className="text-xs font-mono text-ink-500 shrink-0">{r.similarity.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-500">
                <span>{fmt(r.material.source_cpse)}</span>
                <span>·</span>
                <span className="font-mono">{fmt(r.material.existing_material_code)}</span>
                {r.material.category && (
                  <>
                    <span>·</span>
                    <span>{r.material.category}</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
