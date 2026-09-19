import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { searchMaterialsSemantic } from '../services/api'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { fmt } from '../lib/formatters'

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebouncedValue(query, 400)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) {
      setResults(null)
      setError(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    searchMaterialsSemantic({ q: trimmed, limit: 30, signal: controller.signal })
      .then((res) => setResults(res.data))
      .catch((err) => {
        if (err?.original?.code === 'ERR_CANCELED') return
        setError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [debouncedQuery])

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-ink-900">Semantic Search</h1>
          <span className="inline-flex items-center gap-1 text-xs text-signal-info bg-signal-infoBg border border-signal-info/30 rounded-sm px-1.5 py-0.5">
            <Sparkles size={11} />
            Embedding-based
          </span>
        </div>
        <p className="text-sm text-ink-500">
          Finds materials by meaning, not exact wording — the same embedding backend used by the matching engine.
          This is not a plain database text search.
        </p>
      </div>

      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "15mm CPVC ball valve socket"'
          className="w-full text-sm border border-ink-200 rounded-md pl-9 pr-3 py-2.5 placeholder:text-ink-300 bg-white"
          autoFocus
        />
      </div>

      {loading && <LoadingState label="Searching…" />}
      {!loading && error && <ErrorState message={error.message} />}

      {!loading && !error && query.trim().length < 2 && (
        <div className="text-sm text-ink-400 text-center py-16">
          Type at least 2 characters to search standardized material descriptions across all CPSEs.
        </div>
      )}

      {!loading && !error && results && results.length === 0 && (
        <EmptyState title="No materials matched that description." description="Try a shorter or more general phrase." />
      )}

      {!loading && !error && results && results.length > 0 && (
        <div className="card-surface bg-white border border-ink-200 rounded-md divide-y divide-ink-100">
          {results.map((r) => (
            <button
              key={r.material.id}
              onClick={() => navigate(`/materials/${r.material.id}`)}
              className="w-full text-left px-4 py-3 hover:bg-surface-sunk flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm text-ink-900 font-medium truncate">
                  {fmt(r.material.standardized_description || r.material.material_description)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-ink-500 flex-wrap">
                  <span>{fmt(r.material.source_cpse)}</span>
                  <span>·</span>
                  <span className="font-mono">{fmt(r.material.existing_material_code)}</span>
                  {r.material.category && (
                    <>
                      <span>·</span>
                      <span>{r.material.category}</span>
                    </>
                  )}
                  {r.material.national_material_code && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{r.material.national_material_code}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono text-ink-900">{r.similarity.toFixed(1)}%</div>
                <div className="text-[0.65rem] text-ink-400">relevance</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
