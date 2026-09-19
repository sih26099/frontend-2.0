const EMPTY = '—'

export function fmt(value) {
  if (value === null || value === undefined || value === '') return EMPTY
  return value
}

export function fmtNumber(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY
  return Number(value).toLocaleString(undefined, opts)
}

export function fmtDimension(value, unit = 'mm') {
  if (value === null || value === undefined) return EMPTY
  return `${fmtNumber(value)} ${unit}`
}

export function fmtPercent(value, digits = 1) {
  // Backend scores may arrive as 0-1 fractions or already-scaled 0-100
  // depending on endpoint (e.g. semantic search returns 0-100, matching
  // similarities are 0-100 floats too per MatchCandidateOut). Normalize by
  // assuming any value <= 1 is a fraction, since backend confidence scores
  // observed in practice are already in 0-100 form.
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY
  const scaled = value <= 1 ? value * 100 : value
  return `${scaled.toFixed(digits)}%`
}

export function fmtConfidenceValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 0
  return value <= 1 ? value * 100 : value
}

export function fmtDateTime(value) {
  if (!value) return EMPTY
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return EMPTY
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtDate(value) {
  if (!value) return EMPTY
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return EMPTY
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

export function titleCase(value) {
  if (!value) return EMPTY
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export { EMPTY }
