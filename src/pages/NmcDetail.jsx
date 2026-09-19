import { useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowDown, ShieldCheck } from 'lucide-react'
import { getNmcMapping } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import Badge from '../components/common/Badge'
import CopyButton from '../components/common/CopyButton'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { fmt, fmtDateTime } from '../lib/formatters'

export default function NmcDetail() {
  const { code } = useParams()
  const navigate = useNavigate()
  const fetcher = useCallback(() => getNmcMapping(code), [code])
  const { data: nmc, error, loading, refetch } = useApi(fetcher, [code])

  if (loading) return <LoadingState label="Loading National Material Code…" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!nmc) return null

  const activeMembers = nmc.members.filter((m) => m.is_active)
  const supersededMembers = nmc.members.filter((m) => !m.is_active)
  const cpseSources = [...new Set(nmc.members.map((m) => m.source_cpse))]

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'National Codes', to: '/nmc' },
          { label: nmc.national_material_code },
        ]}
      />
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-semibold text-ink-900 font-mono">{nmc.national_material_code}</h1>
          <CopyButton value={nmc.national_material_code} size={15} />
        </div>
        <p className="text-sm text-ink-500">{fmt(nmc.canonical_description)}</p>
      </div>

      <div className="bg-signal-infoBg border border-signal-info/30 rounded-md p-3.5 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-signal-info shrink-0 mt-0.5" />
        <p className="text-sm text-signal-info">
          Legacy material codes are preserved. They are never silently deleted — every historical mapping below
          remains visible even after it's superseded.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <div className="text-xs text-ink-500 mb-1">Linked materials</div>
          <div className="text-2xl font-mono font-semibold text-ink-900">{nmc.members.length}</div>
        </div>
        <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
          <div className="text-xs text-ink-500 mb-1">CPSE sources</div>
          <div className="text-sm text-ink-900 mt-1">{cpseSources.join(', ') || '—'}</div>
        </div>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Legacy code mapping</h2>
        <div className="space-y-4">
          {activeMembers.map((m) => (
            <LegacyMappingChain key={m.material_id + m.created_date} member={m} nmcCode={nmc.national_material_code} />
          ))}
        </div>

        {supersededMembers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-ink-100">
            <h3 className="text-xs font-medium text-ink-500 mb-3">Superseded mappings (kept for history)</h3>
            <div className="scroll-x">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CPSE</th>
                    <th>Legacy code</th>
                    <th>Material</th>
                    <th>Created</th>
                    <th>Superseded</th>
                  </tr>
                </thead>
                <tbody>
                  {supersededMembers.map((m) => (
                    <tr key={m.material_id + m.created_date}>
                      <td>{fmt(m.source_cpse)}</td>
                      <td className="font-mono">{fmt(m.existing_material_code)}</td>
                      <td>
                        <Link to={`/materials/${m.material_id}`} className="text-signal-info hover:underline font-mono text-xs">
                          {m.material_id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="text-xs text-ink-500">{fmtDateTime(m.created_date)}</td>
                      <td className="text-xs text-ink-500">{m.superseded_date ? fmtDateTime(m.superseded_date) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LegacyMappingChain({ member, nmcCode }) {
  return (
    <div className="border border-ink-200 rounded-md p-3.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-ink-900">{nmcCode}</span>
        <Badge variant="good">Active</Badge>
      </div>
      <div className="flex justify-center py-1 text-ink-300">
        <ArrowDown size={13} />
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-mono text-ink-900">
            {member.existing_material_code}
            <CopyButton value={member.existing_material_code} />
          </div>
          <div className="text-xs text-ink-500">Legacy CPSE code</div>
        </div>
        <Link
          to={`/materials/${member.material_id}`}
          className="text-xs text-signal-info hover:underline"
        >
          View material
        </Link>
      </div>
      <div className="flex justify-center py-1 text-ink-300">
        <ArrowDown size={13} />
      </div>
      <div>
        <div className="text-sm text-ink-900">{member.source_cpse}</div>
        <div className="text-xs text-ink-500">Original CPSE</div>
      </div>
    </div>
  )
}
