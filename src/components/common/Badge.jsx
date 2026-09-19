export default function Badge({ children, className = '', variant = 'neutral' }) {
  const variants = {
    neutral: 'bg-ink-100 text-ink-700 border-ink-200',
    good: 'bg-signal-goodBg text-signal-good border-signal-good/30',
    bad: 'bg-signal-badBg text-signal-bad border-signal-bad/30',
    pending: 'bg-signal-pendingBg text-signal-pending border-signal-pending/30',
    info: 'bg-signal-infoBg text-signal-info border-signal-info/30',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium leading-none transition-colors duration-150 ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
