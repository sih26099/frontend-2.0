import { useCallback, useState } from 'react'
import { RefreshCw, Zap, Info } from 'lucide-react'
import { listConnectors, syncCpse, getSyncLogs } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { fmt, fmtDateTime, fmtNumber } from '../lib/formatters'

export default function Sync() {
  const [syncingName, setSyncingName] = useState(null)
  const [syncMessage, setSyncMessage] = useState(null)

  const connectorsFetcher = useCallback(() => listConnectors(), [])
  const { data: connectorsData, error: connectorsError, loading: loadingConnectors } = useApi(connectorsFetcher)

  const logsFetcher = useCallback(() => getSyncLogs({ limit: 100 }), [])
  const { data: logs, error: logsError, loading: loadingLogs, refetch: refetchLogs } = useApi(logsFetcher)

  const connectors = connectorsData?.connectors || []

  function handleSync(name) {
    setSyncingName(name)
    setSyncMessage(null)
    syncCpse(name)
      .then((res) => {
        setSyncMessage({
          type: res.data.status === 'SUCCESS' ? 'success' : 'error',
          text:
            res.data.status === 'SUCCESS'
              ? `${name}: fetched ${res.data.records_fetched}, created ${res.data.records_created}, updated ${res.data.records_updated}.`
              : res.data.error_message || `${name} sync failed.`,
        })
        refetchLogs()
      })
      .catch((err) => setSyncMessage({ type: 'error', text: err.message }))
      .finally(() => setSyncingName(null))
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">CPSE Integration</h1>
        <p className="text-sm text-ink-500">Available CPSE connectors and material master synchronization history.</p>
      </div>

      <div className="bg-signal-infoBg border border-signal-info/30 rounded-md p-3.5 flex items-start gap-2.5">
        <Info size={16} className="text-signal-info shrink-0 mt-0.5" />
        <p className="text-sm text-signal-info">
          <span className="font-medium">Designed for live SAP/ERP integration.</span> The connectors below simulate
          what a real-time sync with each CPSE's system would look like end-to-end. In production, "Sync now" would
          call each CPSE's actual SAP/ERP API rather than a local endpoint.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Connectors</h2>
        {loadingConnectors && <LoadingState label="Loading connectors…" compact />}
        {!loadingConnectors && connectorsError && <ErrorState message={connectorsError.message} compact />}
        {!loadingConnectors && !connectorsError && connectors.length === 0 && (
          <EmptyState title="No connectors configured." description="" />
        )}
        {!loadingConnectors && !connectorsError && connectors.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {connectors.map((name) => (
              <div key={name} className="border border-ink-200 rounded-md p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink-900">{name}</div>
                  <Badge variant="good" className="mt-1">Connected</Badge>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Zap}
                  onClick={() => handleSync(name)}
                  disabled={syncingName === name}
                >
                  {syncingName === name ? 'Syncing…' : 'Sync now'}
                </Button>
              </div>
            ))}
          </div>
        )}
        {syncMessage && (
          <p className={`text-sm mt-3 ${syncMessage.type === 'success' ? 'text-signal-good' : 'text-signal-bad'}`}>
            {syncMessage.text}
          </p>
        )}
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
          <h2 className="text-sm font-semibold text-ink-900">Sync history</h2>
        </div>
        {loadingLogs && <LoadingState variant="table" columns={9} />}
        {!loadingLogs && logsError && <ErrorState message={logsError.message} onRetry={refetchLogs} />}
        {!loadingLogs && !logsError && (!logs || logs.length === 0) && (
          <EmptyState icon={RefreshCw} title="No sync activity yet." description="Trigger a sync above to begin." />
        )}
        {!loadingLogs && !logsError && logs && logs.length > 0 && (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CPSE</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Fetched</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Duplicates found</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{fmt(log.cpse_name)}</td>
                    <td>
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="text-xs text-ink-500">{fmtDateTime(log.sync_started_at)}</td>
                    <td className="text-xs text-ink-500">{log.sync_completed_at ? fmtDateTime(log.sync_completed_at) : '—'}</td>
                    <td className="font-mono">{fmtNumber(log.records_fetched)}</td>
                    <td className="font-mono">{fmtNumber(log.records_created)}</td>
                    <td className="font-mono">{fmtNumber(log.records_updated)}</td>
                    <td className="font-mono">{fmtNumber(log.duplicate_candidates_found)}</td>
                    <td className="text-xs text-signal-bad max-w-xs truncate" title={log.error_message}>
                      {fmt(log.error_message)}
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

function StatusBadge({ status }) {
  const variant = status === 'SUCCESS' ? 'good' : status === 'FAILED' ? 'bad' : 'pending'
  return <Badge variant={variant}>{status}</Badge>
}
