import { Inbox } from 'lucide-react'

export default function EmptyState({
  title = 'No records found.',
  description = 'Upload or synchronize CPSE material data to begin.',
  icon: Icon = Inbox,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-16">
      <Icon size={22} className="text-ink-300 mb-1" />
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {description && <p className="text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
