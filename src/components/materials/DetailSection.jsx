import { fmt } from '../../lib/formatters'

export function DetailSection({ title, children }) {
  return (
    <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
      <h2 className="text-sm font-semibold text-ink-900 mb-3">{title}</h2>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">{children}</dl>
    </div>
  )
}

export function Field({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-xs text-ink-500 mb-0.5">{label}</dt>
      <dd className={`text-sm text-ink-900 ${mono ? 'font-mono' : ''}`}>{fmt(value)}</dd>
    </div>
  )
}
