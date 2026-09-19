export default function StatCard({ label, value, hint, icon: Icon, accent = '#1D4E89' }) {
  return (
    <div className="group card-surface relative overflow-hidden bg-white border border-ink-200 rounded-md px-4 py-3.5 hover:-translate-y-0.5">
      <span
        className="absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between mb-1.5">
        <div className="text-xs text-ink-500">{label}</div>
        {Icon && <Icon size={14} className="text-ink-300 transition-colors duration-200 group-hover:text-ink-500" />}
      </div>
      <div className="text-2xl font-semibold text-ink-900 font-mono leading-none animate-fade-in">{value}</div>
      {hint && <div className="text-xs text-ink-400 mt-1.5">{hint}</div>}
    </div>
  )
}
