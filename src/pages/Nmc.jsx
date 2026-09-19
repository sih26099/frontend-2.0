import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hash } from 'lucide-react'
import { listNmcs } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import { normalizeNmcListItems } from '../lib/transformers'
import { fmt, fmtDate } from '../lib/formatters'
import CopyButton from '../components/common/CopyButton'

export default function Nmc() {
  const navigate = useNavigate()
  const fetcher = useCallback(() => listNmcs(), [])
  const { data, error, loading, refetch } = useApi(fetcher)
  const codes = normalizeNmcListItems(data)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">National Material Codes</h1>
        <p className="text-sm text-ink-500">
          Canonical codes assigned once materials from different CPSEs are approved as harmonized.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        {loading && <LoadingState variant="table" columns={5} />}
        {!loading && error && <ErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && codes.length === 0 && (
          <EmptyState
            icon={Hash}
            title="No national material codes yet."
            description="Codes are assigned automatically when an approval is accepted."
          />
        )}

        {!loading && !error && codes.length > 0 && (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NMC</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Material count</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} onClick={() => navigate(`/nmc/${encodeURIComponent(c.code)}`)} className="cursor-pointer">
                    <td className="font-mono font-medium">
                    <div className="flex items-center gap-1.5">
                      {c.code}
                      <CopyButton value={c.code} />
                    </div>
                  </td>
                    <td className="max-w-sm truncate">{fmt(c.canonicalDescription)}</td>
                    <td>{fmt(c.canonicalCategory)}</td>
                    <td className="font-mono">{c.memberCount}</td>
                    <td className="text-xs text-ink-500">{fmtDate(c.createdDate)}</td>
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
