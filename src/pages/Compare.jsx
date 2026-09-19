import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GitCompareArrows } from 'lucide-react'
import { compareMaterials, getMaterial } from '../services/api'
import MaterialPicker from '../components/matching/MaterialPicker'
import Button from '../components/common/Button'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import ScoreBreakdown from '../components/matching/ScoreBreakdown'
import CriticalConflictWarning from '../components/matching/CriticalConflictWarning'
import AttributeComparisonTable from '../components/matching/AttributeComparisonTable'
import MatchTypeBadge from '../components/common/MatchTypeBadge'
import { fmt, fmtDimension } from '../lib/formatters'
import { MATCH_TYPE_DESCRIPTIONS } from '../lib/constants'

export default function Compare() {
  const location = useLocation()
  const [materialA, setMaterialA] = useState(null)
  const [materialB, setMaterialB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const preselectA = location.state?.preselectA
    if (preselectA) {
      getMaterial(preselectA).then((res) => setMaterialA(res.data)).catch(() => {})
    }
  }, [location.state])

  function handleCompare() {
    if (!materialA || !materialB) return
    setLoading(true)
    setError(null)
    setResult(null)
    compareMaterials({ materialAId: materialA.id, materialBId: materialB.id })
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Compare Materials</h1>
        <p className="text-sm text-ink-500">
          Select two materials to see the full hybrid comparison a human reviewer would use to decide whether they
          should be harmonized.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-4 grid sm:grid-cols-2 gap-4">
        <MaterialPicker label="Material A" selected={materialA} onSelect={setMaterialA} />
        <MaterialPicker label="Material B" selected={materialB} onSelect={setMaterialB} />
      </div>

      <div className="flex justify-center">
        <Button
          variant="primary"
          icon={GitCompareArrows}
          onClick={handleCompare}
          disabled={!materialA || !materialB || loading}
        >
          {loading ? 'Comparing…' : 'Compare'}
        </Button>
      </div>

      {loading && <LoadingState label="Running comparison…" />}
      {!loading && error && <ErrorState message={error} onRetry={handleCompare} />}

      {!loading && !error && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 card-surface bg-white border border-ink-200 rounded-md p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-900">Recommendation</span>
                <MatchTypeBadge matchType={result.match_type} />
              </div>
              <p className="text-sm text-ink-500 mt-1">{MATCH_TYPE_DESCRIPTIONS[result.match_type]}</p>
            </div>
          </div>

          <CriticalConflictWarning conflicts={result.critical_conflicts} comparisons={result.attribute_comparisons} />

          <div className="grid lg:grid-cols-2 gap-4">
            <CompareMaterialCard label="Identity" material={result.material_a} />
            <CompareMaterialCard label="Identity" material={result.material_b} />
          </div>

          <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">AI matching evidence</h2>
            <ScoreBreakdown
              lexical={result.lexical_similarity}
              semantic={result.semantic_similarity}
              technical={result.technical_similarity}
              final={result.final_confidence}
            />
          </div>

          <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Attribute comparison</h2>
            <AttributeComparisonTable comparisons={result.attribute_comparisons} />
          </div>
        </div>
      )}
    </div>
  )
}

function CompareMaterialCard({ label, material }) {
  return (
    <div className="card-surface bg-white border border-ink-200 rounded-md p-4">
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        {label} — {material.source_cpse}
      </h3>
      <dl className="space-y-2 text-sm">
        <Row label="Material code" value={material.existing_material_code} mono />
        <Row label="Description" value={material.standardized_description || material.material_description} />
        <Row label="Category" value={material.category} />
        <Row label="Material type" value={material.material_type} />
        <Row label="Diameter" value={material.diameter != null ? fmtDimension(material.diameter) : null} />
        <Row label="Standard" value={material.standard} />
        <Row label="Connection" value={material.connection_type} />
        <Row label="Pressure rating" value={material.pressure_rating} />
        <Row label="Manufacturer" value={material.manufacturer} />
        <Row label="Supplier" value={material.supplier} />
        <Row label="National Material Code" value={material.national_material_code} mono />
      </dl>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500 shrink-0">{label}</dt>
      <dd className={`text-ink-900 text-right ${mono ? 'font-mono' : ''}`}>{fmt(value)}</dd>
    </div>
  )
}
