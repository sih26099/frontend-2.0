import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    classes: 'border-signal-good/30 bg-signal-goodBg text-signal-good',
    iconClass: 'text-signal-good',
  },
  error: {
    icon: XCircle,
    classes: 'border-signal-bad/30 bg-signal-badBg text-signal-bad',
    iconClass: 'text-signal-bad',
  },
  info: {
    icon: Info,
    classes: 'border-signal-info/30 bg-signal-infoBg text-signal-info',
    iconClass: 'text-signal-info',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-signal-pending/30 bg-signal-pendingBg text-signal-pending',
    iconClass: 'text-signal-pending',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 200)
  }, [])

  const push = useCallback(
    (variant, message, { duration = 4000 } = {}) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, variant, message, leaving: false }])
      if (duration > 0) {
        setTimeout(() => remove(id), duration)
      }
      return id
    },
    [remove]
  )

  const api = {
    success: (message, opts) => push('success', message, opts),
    error: (message, opts) => push('error', message, opts),
    info: (message, opts) => push('info', message, opts),
    warning: (message, opts) => push('warning', message, opts),
    dismiss: remove,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => {
          const { icon: Icon, classes, iconClass } = VARIANTS[t.variant] || VARIANTS.info
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-md border px-3.5 py-3 shadow-card-lg text-sm ${classes} ${
                t.leaving ? 'animate-[fadeOutRight_200ms_ease_both]' : 'animate-[slideInLeft_250ms_cubic-bezier(0.16,1,0.3,1)_both]'
              }`}
              role="status"
            >
              <Icon size={16} className={`shrink-0 mt-0.5 ${iconClass}`} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}