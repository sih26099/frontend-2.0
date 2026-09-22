import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, UploadCloud } from 'lucide-react'
import { useApiHealth } from '../../hooks/useApiHealth'
import GlobalSearch from './GlobalSearch'

export default function Header({ onOpenMobileNav }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const status = useApiHealth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/95 backdrop-blur-sm px-4 transition-shadow duration-250 ${
        scrolled ? 'border-ink-200 shadow-card' : 'border-ink-100'
      }`}
    >
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden text-ink-500 hover:text-ink-900 p-1 -ml-1 rounded transition-colors hover:bg-surface-sunk"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900 truncate">SIH 26099</div>
        <div className="text-[0.7rem] text-ink-500 truncate leading-tight hidden sm:block">
          National Material Harmonization
        </div>
      </div>

      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 rounded-md border border-ink-200 bg-surface-sunk px-3 py-1.5 text-sm text-ink-500 transition-all duration-200 hover:border-signal-info/40 hover:text-ink-700 hover:shadow-card focus-visible:border-signal-info"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search materials…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[0.65rem] font-mono text-ink-400 ml-1">
          {navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl'}K
        </kbd>
      </button>

      <button
        onClick={() => navigate('/upload')}
        className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-navy-900 text-white px-3 py-1.5 text-sm font-medium shadow-card transition-all duration-200 hover:bg-navy-800 hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
      >
        <UploadCloud size={14} />
        Upload
      </button>

      <div className="flex items-center gap-1.5 pl-2 border-l border-ink-100">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          {status === 'connected' && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal-good opacity-60 animate-ping" />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
              status === 'connected'
                ? 'bg-signal-good'
                : status === 'offline'
                  ? 'bg-signal-bad'
                  : 'bg-ink-300 animate-pulse'
            }`}
          />
        </span>
        <span className="text-xs text-ink-500 hidden md:inline">
          {status === 'connected' ? 'API Connected' : status === 'offline' ? 'API Offline' : 'Checking…'}
        </span>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}