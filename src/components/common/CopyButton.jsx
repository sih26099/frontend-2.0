import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

/**
 * Small icon-only copy-to-clipboard button. Designed to sit inline next to
 * a mono-font code value (NMC codes, material codes, IDs). Stops propagation
 * so it's safe to drop inside a clickable table row without triggering
 * row-navigation.
 */
export default function CopyButton({ value, size = 13, className = '' }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!value) return
    navigator.clipboard
      .writeText(String(value))
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      })
      .catch(() => {
        // Clipboard API can fail in insecure contexts / older browsers.
        // Fail silently rather than showing a scary error for a nice-to-have.
      })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      className={`inline-flex items-center justify-center shrink-0 rounded p-0.5 text-ink-300 hover:text-ink-700 hover:bg-surface-sunk transition-colors ${className}`}
    >
      {copied ? <Check size={size} className="text-signal-good" /> : <Copy size={size} />}
    </button>
  )
}
