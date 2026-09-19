import { useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getMatchCandidate, getMaterial } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import MatchTypeBadge from '../components/common/MatchTypeBadge'
import ScoreBreakdown from '../components/matching/ScoreBreakdown'
import CriticalConflictWarning from '../components/matching/CriticalConflictWarning'
import AttributeComparisonTable from '../components/matching/AttributeComparisonTable'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { getAttributeComparisons } from '../lib/transformers'
import { MATCH_TYPE_DESCRIPTIONS } from '../lib/constants'
import { fmt, fmtDateTime } from '../lib/formatters'

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const candidateFetcher = useCallback(() => getMatchCandidate(id), [id])
  const { data: candidate, error, loading, refetch } = useApi(candidateFetcher, [id])

  const materialAFetcher = useCallback(() => {
    if (!candidate) return Promise.reject(new Error('no candidate'))
    return getMaterial(candidate.material_a_id)
  }, [candidate])
  const { data: materialA, loading: loadingA } = useApi(materialAFetcher, [candidate?.material_a_id])

  const materialBFetcher = useCallback(() => {
    if (!candidate) return Promise.reject(new Error('no candidate'))
    return getMaterial(candidate.material_b_id)
  }, [candidate])
  const { data: materialB, loading: loadingB } = useApi(materialBFetcher, [candidate?.material_b_id])

  if (loading) return <LoadingState label="Loading match candidate…" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!candidate) return null

  const comparisons = getAttributeComparisons(candidate)

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Match Candidates', to: '/matches' },
          { label: `Match ${id.slice(0, 8)}` },
        ]}
      />
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-ink-900">Match candidate</h1>
            <MatchTypeBadge matchType={candidate.match_type} />
          </div>
          <p className="text-sm text-ink-500 mt-1">{MATCH_TYPE_DESCRIPTIONS[candidate.match_type]}</p>
        </div>
        <div className="text-xs text-ink-400">Created {fmtDateTime(candidate.created_date)}</div>
      </div>

      <CriticalConflictWarning conflicts={candidate.critical_conflicts} comparisons={comparisons} />

      <div className="grid lg:grid-cols-2 gap-4">
        <MaterialSummaryCard label="Material A" material={materialA} loading={loadingA} />
        <MaterialSummaryCard label="Material B" material={materialB} loading={loadingB} />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Score breakdown</h2>
        <ScoreBreakdown
          lexical={candidate.lexical_similarity}
          semantic={candidate.semantic_similarity}
          technical={candidate.technical_similarity}
          final={candidate.final_confidence}
        />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Attribute comparison</h2>
        <AttributeComparisonTable comparisons={comparisons} />
      </div>
    </div>
  )
}

function MaterialSummaryCard({ label, material, loading }) {
  return (
    <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-ink-900">{label}</h2>
        {material && (
          <Link
            to={`/materials/${material.id}`}
            className="inline-flex items-center gap-1 text-xs text-signal-info hover:underline"
          >
            View full record <ExternalLink size={11} />
          </Link>
        )}
      </div>
      {loading && <div className="text-sm text-ink-400 py-2">Loading…</div>}
      {!loading && material && (
        <dl className="space-y-2 text-sm">
          <Row label="CPSE" value={material.source_cpse} />
          <Row label="Material code" value={material.existing_material_code} mono />
          <Row label="Description" value={material.standardized_description || material.material_description} />
          <Row label="Category" value={material.category} />
          <Row label="Material type" value={material.material_type} />
          <Row label="Diameter" value={material.diameter != null ? `${material.diameter} mm` : null} />
          <Row label="Standard" value={material.standard} />
          <Row label="Connection" value={material.connection_type} />
          <Row label="Pressure rating" value={material.pressure_rating} />
          <Row label="Thread type" value={material.thread_type} />
          <Row label="Manufacturer" value={material.manufacturer} />
        </dl>
      )}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500 shrink-0">{label}</dt>
      <dd className={`text-ink-900 text-right ${mono ? 'font-mono' : ''}`}>{fmt(value)}</dd>
    </div>
  )
}
