// Central place to normalize backend response shapes. The backend's
// Pydantic schemas (app/schemas/schemas.py) are the source of truth; these
// helpers exist only to give components a couple of stable, convenient
// aliases rather than scattering `?? fallback` logic everywhere. They never
// invent data — a missing field stays missing and is rendered as "—" by the
// formatters, not silently defaulted to something plausible-looking.

// MatchCandidateOut already uses `final_confidence`; this alias just gives
// UI code a shorter name to reach for.
export function normalizeMatchCandidate(candidate) {
  if (!candidate) return candidate
  return {
    ...candidate,
    confidence: candidate.final_confidence,
  }
}

export function normalizeMatchCandidates(candidates) {
  return (candidates || []).map(normalizeMatchCandidate)
}

// Extracts the attribute_comparisons array that lives inside the JSON
// `evidence` blob on a MatchCandidateOut (see app/api/matching.py where it's
// written as evidence.attribute_comparisons). Falls back to an empty array
// rather than throwing when evidence is null.
export function getAttributeComparisons(candidate) {
  return candidate?.evidence?.attribute_comparisons || []
}

// NMC list endpoint returns ad-hoc dicts (app/api/nmc.py list_nmcs), not a
// Pydantic model — this documents the shape we depend on ({code,
// canonical_description, canonical_category, created_date, member_count}).
export function normalizeNmcListItem(item) {
  if (!item) return item
  return {
    code: item.code,
    canonicalDescription: item.canonical_description,
    canonicalCategory: item.canonical_category,
    createdDate: item.created_date,
    memberCount: item.member_count,
  }
}

export function normalizeNmcListItems(items) {
  return (items || []).map(normalizeNmcListItem)
}
