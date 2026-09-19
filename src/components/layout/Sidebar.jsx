import { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  Search,
  GitCompareArrows,
  ClipboardCheck,
  Hash,
  RefreshCw,
  History,
  Layers,
  X,
} from 'lucide-react'
import { getDashboardStats } from '../../services/api'
import { useApi } from '../../hooks/useApi'

const sections = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'Materials',
    items: [
      { to: '/materials', label: 'Material Registry', icon: Boxes },
      { to: '/search', label: 'Semantic Search', icon: Search },
    ],
  },
  {
    heading: 'Matching',
    items: [
      { to: '/matches', label: 'Match Candidates', icon: Layers, countKey: 'matches' },
      { to: '/compare', label: 'Compare Materials', icon: GitCompareArrows },
    ],
  },
  {
    items: [{ to: '/approvals', label: 'Approvals', icon: ClipboardCheck, countKey: 'approvals' }],
  },
  {
    items: [{ to: '/nmc', label: 'National Codes', icon: Hash, countKey: 'nmc' }],
  },
  {
    heading: 'CPSE Integration',
    items: [
      { to: '/sync', label: 'Connectors & Sync', icon: RefreshCw },
    ],
  },
  {
    items: [{ to: '/audit', label: 'Audit Trail', icon: History }],
  },
]

function NavItem({ to, label, icon: Icon, end, onNavigate, count }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-200 ${
          isActive
            ? 'bg-navy-700/90 text-white font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : 'text-[#AEBBC9] hover:bg-navy-800/80 hover:text-white hover:translate-x-0.5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-white transition-all duration-250 ease-premium ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            aria-hidden="true"
          />
          <Icon
            size={16}
            strokeWidth={2}
            className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
          />
          <span className="flex-1">{label}</span>
          {count != null && count > 0 && (
            <span
              className={`text-[0.65rem] font-semibold leading-none rounded-full px-1.5 py-0.5 transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'bg-navy-700 text-[#AEBBC9]'
              }`}
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  // Best-effort nav counts. Silently absent (no badge) if the request
  // fails or the backend isn't reachable yet -- the sidebar should never
  // show an error state of its own.
  const statsFetcher = useCallback(() => getDashboardStats(), [])
  const { data: stats } = useApi(statsFetcher)

  const counts = stats
    ? {
        approvals: stats.pending_approvals,
        matches:
          (stats.exact_duplicates || 0) +
          (stats.near_duplicates || 0) +
          (stats.functionally_equivalent || 0) +
          (stats.possible_matches || 0),
        nmc: stats.total_national_codes,
      }
    : {}

  const content = (
    <div className="flex h-full flex-col bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 text-white shadow-nav">
      <div className="flex items-center justify-between px-4 h-14 border-b border-navy-700/80">
        <NavLink to="/" className="flex items-center gap-2 group" onClick={onCloseMobile}>
          <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center transition-all duration-200 group-hover:bg-white/20 group-hover:scale-105">
            <Boxes size={14} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">MaterialHub</div>
          </div>
        </NavLink>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-[#AEBBC9] hover:text-white p-1"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <div className="px-2.5 pb-1 text-[0.65rem] font-semibold text-[#6E7F92] tracking-wide">
                {section.heading}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  count={item.countKey ? counts[item.countKey] : null}
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-navy-700 text-[0.7rem] text-[#6E7F92]">
        SIH 26099 — National Material
        <br />
        Harmonization Platform
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-navy-950/50 animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-[slideInLeft_280ms_cubic-bezier(0.16,1,0.3,1)_both]">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
