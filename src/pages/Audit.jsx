import { useCallback, useState } from 'react'
import { History, Lock } from 'lucide-react'
import { getAuditLogs } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { fmt, fmtDateTime, fmtPercent } from '../lib/formatters'

export default function Audit() {
  const [materialId, setMaterialId] = useState('')
  const [matchCandidateId, setMatchCandidateId] = useState('')

  const fetcher = useCallback(
    () =>
      getAuditLogs({
        materialId: materialId.trim() || undefined,
        matchCandidateId: matchCandidateId.trim() || undefined,
        limit: 300,
      }),
    [materialId, matchCandidateId]
  )
  const { data: logs, error, loading, refetch } = useApi(fetcher, [materialId, matchCandidateId])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Audit Trail</h1>
        <p className="text-sm text-ink-500 flex items-center gap-1.5">
          <Lock size={13} className="text-ink-400" />
          A complete, read-only record of every AI recommendation and human decision.
        </p>
      </div>

      <div className="bg-surface-sunk border border-ink-200 rounded-md p-3 flex items-start gap-2.5 text-xs text-ink-500">
        <Lock size={13} className="text-ink-400 mt-0.5 shrink-0" />
        <span>
          <span className="font-medium text-ink-700">Access note:</span> in a production deployment, Audit Trail
          access would be restricted to administrators and compliance officers only. It's open to every role in
          this demo since no authentication layer has been built yet.
        </span>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-3 flex flex-wrap gap-2">
        <input
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          placeholder="Filter by material ID"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 min-w-[200px] flex-1 max-w-[280px] placeholder:text-ink-300 font-mono"
        />
        <input
          value={matchCandidateId}
          onChange={(e) => setMatchCandidateId(e.target.value)}
          placeholder="Filter by match candidate ID"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 min-w-[200px] flex-1 max-w-[280px] placeholder:text-ink-300 font-mono"
        />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        {loading && <LoadingState variant="table" columns={6} />}
        {!loading && error && <ErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && (!logs || logs.length === 0) && <EmptyState icon={History} />}

        {!loading && !error && logs && logs.length > 0 && (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>AI confidence</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs text-ink-500 whitespace-nowrap">{fmtDateTime(log.timestamp)}</td>
                    <td>{fmt(log.performed_by)}</td>
                    <td className="font-medium">{fmt(log.action)}</td>
                    <td className="font-mono text-xs">
                      {log.material_id
                        ? `material:${log.material_id.slice(0, 8)}`
                        : log.match_candidate_id
                          ? `match:${log.match_candidate_id.slice(0, 8)}`
                          : '—'}
                    </td>
                    <td className="font-mono text-xs">
                      {log.ai_confidence != null ? fmtPercent(log.ai_confidence) : '—'}
                    </td>
                    <td className="max-w-sm truncate text-xs text-ink-500" title={log.reason}>
                      {fmt(log.reason)}
                    </td>
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
