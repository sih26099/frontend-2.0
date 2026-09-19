import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayCircle, Layers } from 'lucide-react'
import { listMatchCandidates, runMatching } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StatCard from '../components/common/StatCard'
import MatchTypeBadge from '../components/common/MatchTypeBadge'
import ConfidenceBar from '../components/common/ConfidenceBar'
import Button from '../components/common/Button'
import { MATCH_TYPES, MATCH_TYPE_LABELS } from '../lib/constants'
import { fmt } from '../lib/formatters'

export default function Matches() {
  const [matchType, setMatchType] = useState('')
  const [minConfidence, setMinConfidence] = useState('')
  const [runningCpse, setRunningCpse] = useState('')
  const [running, setRunning] = useState(false)
  const [runMessage, setRunMessage] = useState(null)
  const [runError, setRunError] = useState(null)
  const navigate = useNavigate()

  const fetcher = useCallback(
    () =>
      listMatchCandidates({
        matchType: matchType || undefined,
        minConfidence: minConfidence ? Number(minConfidence) : undefined,
        limit: 200,
      }),
    [matchType, minConfidence]
  )

  const { data: candidates, error, loading, refetch } = useApi(fetcher, [matchType, minConfidence])

  const summary = summarize(candidates)

  function handleRun() {
    setRunning(true)
    setRunMessage(null)
    setRunError(null)
    runMatching({ cpse: runningCpse.trim() || undefined })
      .then((res) => {
        setRunMessage(res.data.message || `Compared ${res.data.materials_compared} materials — ${res.data.new_candidates_created} new candidates created.`)
        refetch()
      })
      .catch((err) => setRunError(err.message))
      .finally(() => setRunning(false))
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Match Candidates</h1>
        <p className="text-sm text-ink-500">
          Hybrid lexical, semantic, and technical matching results across the material master.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-3.5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1">Run matching for CPSE (optional)</label>
          <input
            value={runningCpse}
            onChange={(e) => setRunningCpse(e.target.value)}
            placeholder="e.g. CPSE-A — leave blank for all"
            className="text-sm border border-ink-200 rounded px-2.5 py-1.5 w-64 placeholder:text-ink-300"
          />
        </div>
        <Button variant="primary" icon={PlayCircle} onClick={handleRun} disabled={running}>
          {running ? 'Running…' : 'Run matching'}
        </Button>
        {runMessage && <span className="text-xs text-signal-good">{runMessage}</span>}
        {runError && <span className="text-xs text-signal-bad">{runError}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total candidates" value={summary.total} />
        <StatCard label="Exact duplicates" value={summary[MATCH_TYPES.EXACT_DUPLICATE]} />
        <StatCard label="Near duplicates" value={summary[MATCH_TYPES.NEAR_DUPLICATE]} />
        <StatCard label="Functionally equivalent" value={summary[MATCH_TYPES.FUNCTIONALLY_EQUIVALENT]} />
        <StatCard label="Possible matches" value={summary[MATCH_TYPES.POSSIBLE_MATCH]} />
        <StatCard label="With critical conflicts" value={summary.withConflicts} />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-3 flex flex-wrap gap-2">
        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5"
        >
          <option value="">All match types</option>
          {Object.values(MATCH_TYPES).map((t) => (
            <option key={t} value={t}>
              {MATCH_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <input
          value={minConfidence}
          onChange={(e) => setMinConfidence(e.target.value)}
          placeholder="Min confidence (e.g. 75)"
          type="number"
          min="0"
          max="100"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 w-48 placeholder:text-ink-300"
        />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        {loading && <LoadingState variant="table" columns={7} />}
        {!loading && error && <ErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && (!candidates || candidates.length === 0) && (
          <EmptyState
            icon={Layers}
            title="No match candidates found."
            description="Run matching above, or upload material data to generate candidates."
          />
        )}

        {!loading && !error && candidates && candidates.length > 0 && (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Match type</th>
                  <th>Final confidence</th>
                  <th>Lexical</th>
                  <th>Semantic</th>
                  <th>Technical</th>
                  <th>Critical conflict</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/matches/${c.id}`)} className="cursor-pointer">
                    <td>
                      <MatchTypeBadge matchType={c.match_type} />
                    </td>
                    <td>
                      <ConfidenceBar value={c.final_confidence} size="sm" />
                    </td>
                    <td className="font-mono text-xs">{c.lexical_similarity?.toFixed(1)}%</td>
                    <td className="font-mono text-xs">{c.semantic_similarity?.toFixed(1)}%</td>
                    <td className="font-mono text-xs">{c.technical_similarity?.toFixed(1)}%</td>
                    <td>
                      {c.critical_conflicts && c.critical_conflicts.length > 0 ? (
                        <span className="text-signal-conflict text-xs font-medium">
                          {c.critical_conflicts.length} conflict{c.critical_conflicts.length === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-ink-300 text-xs">None</span>
                      )}
                    </td>
                    <td className="text-xs text-ink-500">{fmt(c.created_date?.slice?.(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function summarize(candidates) {
  const base = {
    total: 0,
    withConflicts: 0,
    [MATCH_TYPES.EXACT_DUPLICATE]: 0,
    [MATCH_TYPES.NEAR_DUPLICATE]: 0,
    [MATCH_TYPES.FUNCTIONALLY_EQUIVALENT]: 0,
    [MATCH_TYPES.POSSIBLE_MATCH]: 0,
  }
  if (!candidates) return base
  base.total = candidates.length
  for (const c of candidates) {
    if (base[c.match_type] !== undefined) base[c.match_type] += 1
    if (c.critical_conflicts && c.critical_conflicts.length > 0) base.withConflicts += 1
  }
  return base
}
