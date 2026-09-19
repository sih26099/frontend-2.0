export default function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 active:scale-[0.97]'

  const variants = {
    default: 'bg-white border border-ink-200 text-ink-700 hover:bg-surface-sunk hover:border-ink-300 hover:shadow-card',
    primary: 'bg-navy-900 text-white hover:bg-navy-800 border border-navy-900 shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
    danger: 'bg-signal-bad text-white hover:bg-[#7f1616] border border-signal-bad shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
    success: 'bg-signal-good text-white hover:bg-[#124a26] border border-signal-good shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
    ghost: 'text-ink-500 hover:text-ink-900 hover:bg-surface-sunk border border-transparent',
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  )
}
