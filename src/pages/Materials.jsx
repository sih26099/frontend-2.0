import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listMaterials } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'
import { fmt, fmtDimension } from '../lib/formatters'
import { Boxes } from 'lucide-react'

const LIMIT = 25

export default function Materials() {
  const [cpse, setCpse] = useState('')
  const [category, setCategory] = useState('')
  const [nmc, setNmc] = useState('')
  const [offset, setOffset] = useState(0)
  const navigate = useNavigate()

  const fetcher = useCallback(
    () =>
      listMaterials({
        cpse: cpse.trim() || undefined,
        category: category.trim() || undefined,
        nationalMaterialCode: nmc.trim() || undefined,
        limit: LIMIT,
        offset,
      }),
    [cpse, category, nmc, offset]
  )

  const { data: materials, error, loading, refetch } = useApi(fetcher, [cpse, category, nmc, offset])

  function applyFilters(next) {
    setOffset(0)
    next()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Material Registry</h1>
        <p className="text-sm text-ink-500">Standardized material records ingested from every connected CPSE.</p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-3 flex flex-wrap gap-2">
        <input
          value={cpse}
          onChange={(e) => applyFilters(() => setCpse(e.target.value))}
          placeholder="Filter by CPSE"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 min-w-[160px] flex-1 max-w-[220px] placeholder:text-ink-300"
        />
        <input
          value={category}
          onChange={(e) => applyFilters(() => setCategory(e.target.value))}
          placeholder="Filter by category"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 min-w-[160px] flex-1 max-w-[220px] placeholder:text-ink-300"
        />
        <input
          value={nmc}
          onChange={(e) => applyFilters(() => setNmc(e.target.value))}
          placeholder="Filter by National Material Code"
          className="text-sm border border-ink-200 rounded px-2.5 py-1.5 min-w-[200px] flex-1 max-w-[260px] placeholder:text-ink-300"
        />
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md overflow-hidden">
        {loading && <LoadingState variant="table" columns={9} />}
        {!loading && error && <ErrorState message={error.message} onRetry={refetch} />}
        {!loading && !error && (!materials || materials.length === 0) && (
          <EmptyState icon={Boxes} />
        )}

        {!loading && !error && materials && materials.length > 0 && (
          <>
            <div className="scroll-x">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CPSE</th>
                    <th>Material code</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Material type</th>
                    <th>Diameter</th>
                    <th>Standard</th>
                    <th>Manufacturer</th>
                    <th>NMC</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/materials/${m.id}`)}
                      className="cursor-pointer"
                    >
                      <td>{fmt(m.source_cpse)}</td>
                      <td className="font-mono">{fmt(m.existing_material_code)}</td>
                      <td className="max-w-xs truncate" title={m.material_description}>
                        {fmt(m.standardized_description || m.material_description)}
                      </td>
                      <td>{fmt(m.category)}</td>
                      <td>{fmt(m.material_type)}</td>
                      <td>{m.diameter != null ? fmtDimension(m.diameter) : '—'}</td>
                      <td>{fmt(m.standard)}</td>
                      <td>{fmt(m.manufacturer)}</td>
                      <td className="font-mono">{fmt(m.national_material_code)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination offset={offset} limit={LIMIT} count={materials.length} onOffsetChange={setOffset} />
          </>
        )}
      </div>
    </div>
  )
}
