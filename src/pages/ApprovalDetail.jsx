import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { getApproval, getMatchCandidate, getMaterial, decideApproval } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import ApprovalStatusBadge from '../components/common/ApprovalStatusBadge'
import MatchTypeBadge from '../components/common/MatchTypeBadge'
import ScoreBreakdown from '../components/matching/ScoreBreakdown'
import CriticalConflictWarning from '../components/matching/CriticalConflictWarning'
import AttributeComparisonTable from '../components/matching/AttributeComparisonTable'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { getAttributeComparisons } from '../lib/transformers'
import { fmt, fmtDateTime } from '../lib/formatters'
import { useToast } from '../components/common/Toast'

export default function ApprovalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDecision, setPendingDecision] = useState(null)
  const [performedBy, setPerformedBy] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const approvalFetcher = useCallback(() => getApproval(id), [id])
  const { data: approval, error, loading, refetch } = useApi(approvalFetcher, [id])

  const candidateFetcher = useCallback(() => {
    if (!approval) return Promise.reject(new Error('no approval'))
    return getMatchCandidate(approval.match_candidate_id)
  }, [approval])
  const { data: candidate, loading: loadingCandidate } = useApi(candidateFetcher, [approval?.match_candidate_id])

  const materialAFetcher = useCallback(() => {
    if (!candidate) return Promise.reject(new Error('no candidate'))
    return getMaterial(candidate.material_a_id)
  }, [candidate])
  const { data: materialA } = useApi(materialAFetcher, [candidate?.material_a_id])

  const materialBFetcher = useCallback(() => {
    if (!candidate) return Promise.reject(new Error('no candidate'))
    return getMaterial(candidate.material_b_id)
  }, [candidate])
  const { data: materialB } = useApi(materialBFetcher, [candidate?.material_b_id])

  if (loading) return <LoadingState label="Loading approval…" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!approval) return null

  const isPending = approval.status === 'PENDING'
  const comparisons = candidate ? getAttributeComparisons(candidate) : []

  function openConfirm(decision) {
    setPendingDecision(decision)
    setPerformedBy('')
    setReason('')
    setSubmitError(null)
    setConfirmOpen(true)
  }

  function submitDecision() {
    if (!performedBy.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    decideApproval({ approvalId: id, decision: pendingDecision, performedBy: performedBy.trim(), reason })
      .then(() => {
        setConfirmOpen(false)
        refetch()
        const label =
          pendingDecision === 'APPROVE' ? 'approved' : pendingDecision === 'REJECT' ? 'rejected' : 'marked for review'
        toast.success(`Approval ${label}.`)
      })
      .catch((err) => {
        setSubmitError(err.message)
        toast.error(`Could not submit decision: ${err.message}`)
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Approvals', to: '/approvals' },
          { label: `Approval ${id.slice(0, 8)}` },
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
            <h1 className="text-lg font-semibold text-ink-900">Approval</h1>
            <ApprovalStatusBadge status={approval.status} />
          </div>
          <p className="text-sm text-ink-500 mt-1 font-mono">{approval.id}</p>
        </div>
        <div className="text-xs text-ink-400 text-right">
          <div>Created {fmtDateTime(approval.created_date)}</div>
          {approval.approval_date && <div>Decided {fmtDateTime(approval.approval_date)}</div>}
        </div>
      </div>

      {!isPending && (
        <div className="bg-surface-sunk border border-ink-200 rounded-md p-3 text-sm text-ink-700">
          This approval was resolved by <span className="font-medium">{fmt(approval.approved_by)}</span>
          {approval.reason ? <> — "{approval.reason}"</> : null}. It cannot be changed.
        </div>
      )}

      {loadingCandidate && <LoadingState label="Loading matching evidence…" compact />}

      {candidate && (
        <>
          <div className="card-surface bg-white border border-ink-200 rounded-md p-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-ink-900">Match type</span>
            <MatchTypeBadge matchType={candidate.match_type} />
          </div>

          <CriticalConflictWarning conflicts={candidate.critical_conflicts} comparisons={comparisons} />

          <div className="grid lg:grid-cols-2 gap-4">
            <MaterialCard label="Material A" material={materialA} />
            <MaterialCard label="Material B" material={materialB} />
          </div>

          <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Matching evidence</h2>
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
        </>
      )}

      {isPending && (
        <div className="card-surface bg-white border border-ink-200 rounded-md p-4 flex flex-wrap gap-2 sticky bottom-4">
          <Button variant="success" icon={CheckCircle2} onClick={() => openConfirm('APPROVE')}>
            Approve
          </Button>
          <Button variant="danger" icon={XCircle} onClick={() => openConfirm('REJECT')}>
            Reject
          </Button>
          <Button variant="default" icon={HelpCircle} onClick={() => openConfirm('NEEDS_REVIEW')}>
            Needs review
          </Button>
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        title={
          pendingDecision === 'APPROVE'
            ? 'Approve this harmonization?'
            : pendingDecision === 'REJECT'
              ? 'Reject this match?'
              : 'Mark as needs review?'
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={pendingDecision === 'APPROVE' ? 'success' : pendingDecision === 'REJECT' ? 'danger' : 'primary'}
              size="sm"
              onClick={submitDecision}
              disabled={submitting || !performedBy.trim()}
            >
              {submitting ? 'Submitting…' : 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {pendingDecision === 'APPROVE' && (
            <p className="text-sm text-ink-700">
              Approving will allow the system to assign or reuse a National Material Code and create a legacy
              mapping. <span className="font-medium">This action changes the material master.</span>
            </p>
          )}
          {pendingDecision === 'REJECT' && (
            <p className="text-sm text-ink-700">This does not modify the material master.</p>
          )}
          {pendingDecision === 'NEEDS_REVIEW' && (
            <p className="text-sm text-ink-700">This does not modify the material master.</p>
          )}

          <div>
            <label className="block text-xs text-ink-500 mb-1">Your name (performed by)</label>
            <input
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full text-sm border border-ink-200 rounded px-3 py-2"
              placeholder="e.g. reviewer.name"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full text-sm border border-ink-200 rounded px-3 py-2"
            />
          </div>
          {submitError && <p className="text-sm text-signal-bad">{submitError}</p>}
        </div>
      </Modal>
    </div>
  )
}

function MaterialCard({ label, material }) {
  return (
    <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
      <h3 className="text-sm font-semibold text-ink-900 mb-3">{label}</h3>
      {!material ? (
        <div className="text-sm text-ink-400">Loading…</div>
      ) : (
        <dl className="space-y-2 text-sm">
          <Row label="CPSE" value={material.source_cpse} />
          <Row label="Material code" value={material.existing_material_code} mono />
          <Row label="Description" value={material.standardized_description || material.material_description} />
          <Row label="Category" value={material.category} />
          <Row label="Material type" value={material.material_type} />
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