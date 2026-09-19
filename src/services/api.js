import axios from 'axios'

// Never hardcode the backend URL elsewhere in the app — everything goes
// through this client, and this is the one place the base URL is read.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Normalizes FastAPI's {"detail": "..."} error shape into a plain message
// string so components never have to know the backend's error envelope.
function extractErrorMessage(error) {
  if (error.response) {
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      // FastAPI validation errors: [{loc, msg, type}, ...]
      return detail.map((d) => d.msg).join('; ')
    }
    return `Request failed with status ${error.response.status}`
  }
  if (error.request) {
    return 'Could not reach the API. Confirm the backend is running and reachable.'
  }
  return error.message || 'Unknown request error'
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = extractErrorMessage(error)
    return Promise.reject({ message, status: error.response?.status, original: error })
  }
)

// ---------------------------------------------------------------------------
// Health / connectivity
// ---------------------------------------------------------------------------

export function checkApiHealth() {
  // /api/dashboard/stats is a real, lightweight endpoint — used as the
  // connectivity probe rather than hardcoding a "Connected" indicator.
  return apiClient.get('/dashboard/stats')
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function getDashboardStats() {
  return apiClient.get('/dashboard/stats')
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export function uploadMaterials({ file, cpseName, onUploadProgress }) {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post('/materials/upload', formData, {
    params: { cpse_name: cpseName },
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

export function listMaterials({ cpse, category, nationalMaterialCode, limit = 100, offset = 0 } = {}) {
  return apiClient.get('/materials', {
    params: {
      cpse: cpse || undefined,
      category: category || undefined,
      national_material_code: nationalMaterialCode || undefined,
      limit,
      offset,
    },
  })
}

export function getMaterial(materialId) {
  return apiClient.get(`/materials/${materialId}`)
}

export function searchMaterialsSemantic({ q, limit = 20, signal } = {}) {
  return apiClient.get('/materials/search/semantic', {
    params: { q, limit },
    signal,
  })
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

export function runMatching({ cpse } = {}) {
  return apiClient.post('/matching/run', null, {
    params: cpse ? { cpse } : undefined,
  })
}

export function listMatchCandidates({ matchType, minConfidence, limit = 100 } = {}) {
  return apiClient.get('/matching/candidates', {
    params: {
      match_type: matchType || undefined,
      min_confidence: minConfidence ?? undefined,
      limit,
    },
  })
}

export function getMatchCandidate(candidateId) {
  return apiClient.get(`/matching/candidates/${candidateId}`)
}

export function compareMaterials({ materialAId, materialBId }) {
  return apiClient.post('/matching/compare', {
    material_a_id: materialAId,
    material_b_id: materialBId,
  })
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------

export function listApprovals({ status, limit = 100 } = {}) {
  return apiClient.get('/approvals', {
    params: { status: status || undefined, limit },
  })
}

export function getApproval(approvalId) {
  return apiClient.get(`/approvals/${approvalId}`)
}

export function decideApproval({ approvalId, decision, performedBy, reason }) {
  return apiClient.post(`/approvals/${approvalId}/decide`, {
    decision,
    performed_by: performedBy,
    reason: reason || undefined,
  })
}

// ---------------------------------------------------------------------------
// National Material Codes
// ---------------------------------------------------------------------------

export function listNmcs() {
  return apiClient.get('/nmc')
}

export function getNmcMapping(code) {
  return apiClient.get(`/nmc/${encodeURIComponent(code)}`)
}

// ---------------------------------------------------------------------------
// CPSE Sync
// ---------------------------------------------------------------------------

export function listConnectors() {
  return apiClient.get('/sync/connectors')
}

export function syncCpse(cpseName) {
  return apiClient.post(`/sync/${encodeURIComponent(cpseName)}`)
}

export function getSyncLogs({ cpse, limit = 50 } = {}) {
  return apiClient.get('/sync/logs', {
    params: { cpse: cpse || undefined, limit },
  })
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function getAuditLogs({ materialId, matchCandidateId, limit = 100 } = {}) {
  return apiClient.get('/audit', {
    params: {
      material_id: materialId || undefined,
      match_candidate_id: matchCandidateId || undefined,
      limit,
    },
  })
}
