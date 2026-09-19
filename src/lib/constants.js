// Mirrors app/models/models.py exactly. Do not add classifications the
// backend does not have (e.g. there is no RELATED or NO_MATCH type — the
// lowest classification the backend stores is DISTINCT_MATERIAL, and in
// practice DISTINCT_MATERIAL pairs are filtered out before persistence).
export const MATCH_TYPES = {
  EXACT_DUPLICATE: 'EXACT_DUPLICATE',
  NEAR_DUPLICATE: 'NEAR_DUPLICATE',
  FUNCTIONALLY_EQUIVALENT: 'FUNCTIONALLY_EQUIVALENT',
  POSSIBLE_MATCH: 'POSSIBLE_MATCH',
  DISTINCT_MATERIAL: 'DISTINCT_MATERIAL',
}

export const MATCH_TYPE_LABELS = {
  EXACT_DUPLICATE: 'Exact duplicate',
  NEAR_DUPLICATE: 'Near duplicate',
  FUNCTIONALLY_EQUIVALENT: 'Functionally equivalent',
  POSSIBLE_MATCH: 'Possible match',
  DISTINCT_MATERIAL: 'Distinct material',
}

export const MATCH_TYPE_DESCRIPTIONS = {
  EXACT_DUPLICATE: 'Same material or equivalent technical identity across CPSEs.',
  NEAR_DUPLICATE: 'Very similar records with only minor differences.',
  FUNCTIONALLY_EQUIVALENT: 'Worded differently but technically and functionally equivalent.',
  POSSIBLE_MATCH: 'Related enough to warrant human review, but not confidently a duplicate.',
  DISTINCT_MATERIAL: 'Not equivalent — the matching engine does not treat this pair as related.',
}

// Tailwind class fragments per match type, used by the Badge component.
export const MATCH_TYPE_STYLES = {
  EXACT_DUPLICATE: 'bg-signal-goodBg text-signal-good border-signal-good/30',
  NEAR_DUPLICATE: 'bg-signal-infoBg text-signal-info border-signal-info/30',
  FUNCTIONALLY_EQUIVALENT: 'bg-[#F1EAFB] text-[#5B21B6] border-[#5B21B6]/25',
  POSSIBLE_MATCH: 'bg-signal-pendingBg text-signal-pending border-signal-pending/30',
  DISTINCT_MATERIAL: 'bg-ink-100 text-ink-500 border-ink-200',
}

// Mirrors ApprovalStatus in app/models/models.py.
export const APPROVAL_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
}

export const APPROVAL_STATUS_STYLES = {
  PENDING: 'bg-signal-pendingBg text-signal-pending border-signal-pending/30',
  APPROVED: 'bg-signal-goodBg text-signal-good border-signal-good/30',
  REJECTED: 'bg-signal-badBg text-signal-bad border-signal-bad/30',
  NEEDS_REVIEW: 'bg-signal-infoBg text-signal-info border-signal-info/30',
}

// Mirrors MaterialStatus in app/models/models.py.
export const MATERIAL_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OBSOLETE: 'OBSOLETE',
  UNDER_REVIEW: 'UNDER_REVIEW',
}

// The five attributes app/services/matching.py treats as critical — a
// conflict on any of these blocks an EXACT/NEAR duplicate classification.
export const CRITICAL_ATTRIBUTES = [
  'material_type',
  'diameter',
  'standard',
  'pressure_rating',
  'thread_type',
]

// Sync log status strings written by app/services/ingestion.py (plain
// strings on the model, not a SQLAlchemy enum).
export const SYNC_STATUSES = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
}
