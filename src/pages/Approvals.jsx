import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, XCircle, HelpCircle, Zap } from 'lucide-react'
import { listApprovals, getMatchCandidate, decideApproval } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import ApprovalStatusBadge from '../components/common/ApprovalStatusBadge'
import ConfidenceBar from '../components/common/ConfidenceBar'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { APPROVAL_STATUSES } from '../lib/constants'
import { fmt, fmtDateTime } from '../lib/formatters'

const BULK_CONFIDENCE_THRESHOLD = 95

export default function Approvals() {
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  const fetcher = useCallback(() => listApprovals({ status: status || undefined, limit: 200 }), [status])
  const { data: approvals, error, loading, refetch } = useApi(fetcher, [status])

  // Selection state, keyed by approval id. Only PENDING approvals are ever
  // selectable, so this is cleared whenever the underlying list changes.
  const [selected, setSelected] = useState(() => new Set())
  useEffect(() => {
    setSelected(new Set())
  }, [approvals])

  const pendingApprovals = useMemo(
    () => (approvals || []).filter((a) => a.status === APPROVAL_STATUSES.PENDING),
    [approvals]
  )

  // Bulk actions need to know each pending approval's match confidence, but
  // the approvals list endpoint doesn't embed it — fetch it per pending
  // approval, same call ApprovalDetail already makes for one at a time.
  const [candidateByApprovalId, setCandidateByApprovalId] = useState({})
  const [loadingConfidence, setLoadingConfidence] = useState(false)

  useEffect(() => {
    if (pendingApprovals.length === 0) {
      setCandidateByApprovalId({})
      return
    }
    let cancelled = false
    setLoadingConfidence(true)
    Promise.allSettled(
      pendingApprovals.map((a) =>
        getMatchCandidate(a.match_candidate_id).then((res) => [a.id, res.data])
      )
    ).then((results) => {
      if (cancelled) return
      const next = {}
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          const [approvalId, candidate] = r.value
          next[approvalId] = candidate
        }
      })
      setCandidateByApprovalId(next)
      setLoadingConfidence(false)
    })
    return () => {
      cancelled = true
    }
  }, [pendingApprovals])

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllPending() {
    setSelected((prev) => (prev.size === pendingApprovals.length ? new Set() : new Set(pendingApprovals.map((a) => a.id))))
  }

  function selectHighConfidence() {
    const ids = pendingApprovals
      .filter((a) => {
        const c = candidateByApprovalId[a.id]
        if (!c || c.final_confidence == null) return false
        const pct = c.final_confidence <= 1 ? c.final_confidence * 100 : c.final_confidence
        return pct >= BULK_CONFIDENCE_THRESHOLD
      })
      .map((a) => a.id)
    setSelected(new Set(ids))
  }

  // Bulk decision modal
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkDecision, setBulkDecision] = useState(null)
  const [performedBy, setPerformedBy] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)

  function openBulk(decision) {
    setBulkDecision(decision)
    setPerformedBy('')
    setReason('')
    setBulkResult(null)
    setBulkOpen(true)
  }

  function submitBulk() {
    if (!performedBy.trim() || selected.size === 0) return
    setSubmitting(true)
    setBulkResult(null)
    const ids = Array.from(selected)
    Promise.allSettled(
      ids.map((approvalId) =>
        decideApproval({ approvalId, decision: bulkDecision, performedBy: performedBy.trim(), reason: reason || undefined })
      )
    ).then((results) => {
      const failedIds = ids.filter((_, i) => results[i].status === 'rejected')
      const succeeded = ids.length - failedIds.length
      setBulkResult({ succeeded, failed: failedIds.length })
      setSubmitting(false)
      if (failedIds.length === 0) {
        setBulkOpen(false)
        setSelected(new Set())
      } else {
        setSelected(new Set(failedIds))
      }
      refetch()
    })
  }

  const decisionCopy = {
    APPROVE: { title: 'Approve selected harmonizations?', verb: 'Approve', variant: 'success' },
    REJECT: { title: 'Reject selected matches?', verb: 'Reject', variant: 'danger' },
    NEEDS_REVIEW: { title: 'Mark selected as needs review?', verb: 'Confirm', variant: 'primary' },
  }[bulkDecision] || { title: '', verb: 'Confirm', variant: 'primary' }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Approval Queue</h1>
        <p className="text-sm text-ink-500">
          AI-recommended harmonizations awaiting human review. Nothing changes the material master until approved.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-3 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5"
        >
          <option value="">All statuses</option>
          {Object.values(APPROVAL_STATUSES).map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>

        {pendingApprovals.length > 0 && (
          <>
            <div className="h-4 w-px bg-ink-200 mx-1" />
            <button
              onClick={selectHighConfidence}
              disabled={loadingConfidence}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-signal-info hover:underline disabled:opacity-50 disabled:no-underline"
              title={`Select all pending approvals with match confidence ≥ ${BULK_CONFIDENCE_THRESHOLD}%`}
            >
              <Zap size={13} />
              {loadingConfidence ? 'Checking confidence…' : `Select ≥${BULK_CONFIDENCE_THRESHOLD}% confidence`}
            </button>
          </>
        )}
      </div>

      {selected.size > 0 && (
        <div className="bg-navy-900 text-white rounded-md p-3 flex flex-wrap items-center gap-3 sticky top-[3.75rem] z-10 shadow-panel">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => openBulk('APPROVE')}>
            Approve selected
          </Button>
          <Button variant="danger" size="sm" icon={XCircle} onClick={() => openBulk('REJECT')}>
            Reject selected
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-navy-800" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        {loading && <LoadingState variant="table" columns={7} />}
        {!loading && error && <ErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && (!approvals || approvals.length === 0) && (
          <EmptyState
            icon={ClipboardCheck}
            title={status === APPROVAL_STATUSES.PENDING ? 'All caught up! No pending approvals.' : 'No records found.'}
          />
        )}

        {!loading && !error && approvals && approvals.length > 0 && (
          <div className="scroll-x">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">
                    {pendingApprovals.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selected.size === pendingApprovals.length}
                        onChange={toggleAllPending}
                        className="accent-navy-900"
                        aria-label="Select all pending approvals"
                      />
                    )}
                  </th>
                  <th>Approval ID</th>
                  <th>Status</th>
                  <th>Match confidence</th>
                  <th>Reviewer</th>
                  <th>Created</th>
                  <th>Decided</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((a) => {
                  const isPending = a.status === APPROVAL_STATUSES.PENDING
                  const candidate = candidateByApprovalId[a.id]
                  return (
                    <tr key={a.id} onClick={() => navigate(`/approvals/${a.id}`)} className="cursor-pointer">
                      <td onClick={(e) => e.stopPropagation()}>
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={selected.has(a.id)}
                            onChange={() => toggleOne(a.id)}
                            className="accent-navy-900"
                            aria-label={`Select approval ${a.id}`}
                          />
                        )}
                      </td>
                      <td className="font-mono text-xs">{a.id.slice(0, 8)}</td>
                      <td>
                        <ApprovalStatusBadge status={a.status} />
                      </td>
                      <td>
                        {isPending ? (
                          candidate ? (
                            <ConfidenceBar value={candidate.final_confidence} />
                          ) : (
                            <span className="text-xs text-ink-300">
                              {loadingConfidence ? 'Loading…' : '—'}
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-ink-300">—</span>
                        )}
                      </td>
                      <td>{fmt(a.approved_by)}</td>
                      <td className="text-xs text-ink-500">{fmtDateTime(a.created_date)}</td>
                      <td className="text-xs text-ink-500">{a.approval_date ? fmtDateTime(a.approval_date) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={bulkOpen}
        onClose={() => !submitting && setBulkOpen(false)}
        title={decisionCopy.title}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setBulkOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={decisionCopy.variant}
              size="sm"
              onClick={submitBulk}
              disabled={submitting || !performedBy.trim()}
            >
              {submitting ? 'Submitting…' : `${decisionCopy.verb} ${selected.size}`}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-700">
            This will apply the same decision to <span className="font-medium">{selected.size}</span> approval
            {selected.size === 1 ? '' : 's'}.
            {bulkDecision === 'APPROVE' && (
              <span className="font-medium"> Each approved item changes the material master.</span>
            )}
          </p>
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
            <label className="block text-xs text-ink-500 mb-1">Reason (optional, applied to all)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full text-sm border border-ink-200 rounded px-3 py-2"
            />
          </div>
          {bulkResult && bulkResult.failed > 0 && (
            <p className="text-sm text-signal-bad">
              {bulkResult.succeeded} succeeded, {bulkResult.failed} failed. Failed items remain selected — retry or
              review them individually.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
