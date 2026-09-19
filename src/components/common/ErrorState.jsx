import { AlertTriangle, RotateCw } from 'lucide-react'

export default function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 ${compact ? 'py-8' : 'py-16'}`}>
      <div className="flex items-center gap-2 text-signal-bad">
        <AlertTriangle size={18} />
        <span className="text-sm font-medium">Request failed</span>
      </div>
      <p className="text-sm text-ink-500 max-w-md">
        {message || 'Something went wrong while talking to the API.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-sunk transition-colors"
        >
          <RotateCw size={14} />
          Retry
        </button>
      )}
    </div>
  )
}
