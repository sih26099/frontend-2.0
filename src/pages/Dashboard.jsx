import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Info, Boxes, Building2, Layers, ClipboardCheck, Hash, TrendingDown } from 'lucide-react'
import { getDashboardStats } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import StatCard from '../components/common/StatCard'
import DistributionBar from '../components/common/DistributionBar'
import { fmtNumber, fmtDateTime, fmt } from '../lib/formatters'
import { MATCH_TYPE_LABELS, MATCH_TYPE_STYLES } from '../lib/constants'

const MATCH_TYPE_COLOR_HEX = {
  'Exact duplicate': '#166534',
  'Near duplicate': '#1D4E89',
  'Functionally equivalent': '#5B21B6',
  'Possible match': '#9A6700',
}

const APPROVAL_COLOR_HEX = {
  Pending: '#9A6700',
  Approved: '#166534',
  Rejected: '#991B1B',
}

export default function Dashboard() {
  const fetcher = useCallback(() => getDashboardStats(), [])
  const { data: stats, error, loading, refetch } = useApi(fetcher)

  if (loading) return <LoadingState label="Loading dashboard statistics…" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!stats) return null

  const matchDistributionRows = [
    { label: 'Exact duplicate', value: stats.exact_duplicates },
    { label: 'Near duplicate', value: stats.near_duplicates },
    { label: 'Functionally equivalent', value: stats.functionally_equivalent },
    { label: 'Possible match', value: stats.possible_matches },
  ]

  const approvalDistributionRows = [
    { label: 'Pending', value: stats.pending_approvals },
    { label: 'Approved', value: stats.approved_mappings },
    { label: 'Rejected', value: stats.rejected_mappings },
  ]

  const cpseEntries = Object.entries(stats.materials_by_cpse || {})
  const categoryEntries = Object.entries(stats.material_categories || {})
  const totalMatchCandidates =
    stats.exact_duplicates + stats.near_duplicates + stats.functionally_equivalent + stats.possible_matches

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500">Live standardization and harmonization status across all CPSEs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total materials', value: fmtNumber(stats.total_materials), icon: Boxes, accent: '#1D4E89' },
          { label: 'CPSEs connected', value: fmtNumber(cpseEntries.length), icon: Building2, accent: '#5B21B6' },
          { label: 'Match candidates', value: fmtNumber(totalMatchCandidates), icon: Layers, accent: '#9A6700' },
          { label: 'Pending approvals', value: fmtNumber(stats.pending_approvals), icon: ClipboardCheck, accent: '#C2410C' },
          { label: 'National codes', value: fmtNumber(stats.total_national_codes), icon: Hash, accent: '#166534' },
          {
            label: 'Duplicate reduction',
            value: stats.duplicate_reduction_pct ? `${stats.duplicate_reduction_pct}%` : '—',
            hint: 'Across materials assigned an NMC',
            icon: TrendingDown,
            accent: '#166534',
          },
        ].map((card, i) => (
          <div key={card.label} className="animate-fade-in-up stagger-item" style={{ '--stagger-i': i }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Matching distribution</h2>
            <Link to="/matches" className="text-xs text-signal-info hover:underline">
              View candidates
            </Link>
          </div>
          <DistributionBar rows={matchDistributionRows} colorFor={(l) => MATCH_TYPE_COLOR_HEX[l]} />
        </div>

        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Approval distribution</h2>
            <Link to="/approvals" className="text-xs text-signal-info hover:underline">
              View queue
            </Link>
          </div>
          <DistributionBar rows={approvalDistributionRows} colorFor={(l) => APPROVAL_COLOR_HEX[l]} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Materials by CPSE</h2>
          {cpseEntries.length === 0 ? (
            <div className="text-sm text-ink-400 py-4 text-center">No materials ingested yet.</div>
          ) : (
            <DistributionBar rows={cpseEntries.map(([label, value]) => ({ label, value }))} />
          )}
        </div>

        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Material categories</h2>
          {categoryEntries.length === 0 ? (
            <div className="text-sm text-ink-400 py-4 text-center">No categorized materials yet.</div>
          ) : (
            <DistributionBar rows={categoryEntries.map(([label, value]) => ({ label, value }))} />
          )}
        </div>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-900">Recent CPSE activity</h2>
          <Link to="/sync" className="text-xs text-signal-info hover:underline">
            View sync history
          </Link>
        </div>
        {!stats.recently_synced || stats.recently_synced.length === 0 ? (
          <div className="text-sm text-ink-400 py-4 text-center">No sync activity yet.</div>
        ) : (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CPSE</th>
                  <th>Status</th>
                  <th>Records fetched</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {stats.recently_synced.map((s, i) => (
                  <tr key={i}>
                    <td className="font-medium">{fmt(s.cpse)}</td>
                    <td>{fmt(s.status)}</td>
                    <td className="font-mono">{fmtNumber(s.records_fetched)}</td>
                    <td>{fmtDateTime(s.sync_completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HowMatchingWorks />
    </div>
  )
}

function HowMatchingWorks() {
  return (
    <details className="card-surface bg-white border border-ink-200 rounded-md p-4 group">
      <summary className="flex items-center gap-2 text-sm font-semibold text-ink-900 cursor-pointer list-none">
        <Info size={15} className="text-ink-400" />
        How matching works
        <span className="ml-auto text-ink-400 text-xs group-open:hidden">Show</span>
        <span className="ml-auto text-ink-400 text-xs hidden group-open:inline">Hide</span>
      </summary>
      <div className="mt-3 grid sm:grid-cols-3 gap-4 text-sm text-ink-700">
        <div>
          <div className="font-medium text-ink-900 mb-1">Lexical</div>
          <p className="text-ink-500">RapidFuzz compares wording and token similarity between descriptions.</p>
        </div>
        <div>
          <div className="font-medium text-ink-900 mb-1">Semantic</div>
          <p className="text-ink-500">
            Sentence-transformer embeddings (or a TF-IDF fallback) identify similar meaning even when wording differs.
          </p>
        </div>
        <div>
          <div className="font-medium text-ink-900 mb-1">Technical</div>
          <p className="text-ink-500">Structured attributes — diameter, standard, pressure rating, and more — are compared independently.</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-500 border-t border-ink-100 pt-3">
        <span className="font-medium text-ink-900">Critical safety rule:</span> a conflict on a critical attribute
        (material type, diameter, standard, pressure rating, thread type) prevents a high-confidence textual match
        from being treated as an exact or near duplicate — human review always has the final say.
      </p>
    </details>
  )
}
