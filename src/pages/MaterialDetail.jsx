import { useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, GitCompareArrows } from 'lucide-react'
import { getMaterial } from '../services/api'
import { useApi } from '../hooks/useApi'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import Button from '../components/common/Button'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { DetailSection, Field } from '../components/materials/DetailSection'
import { fmtDateTime, fmtDimension } from '../lib/formatters'

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fetcher = useCallback(() => getMaterial(id), [id])
  const { data: m, error, loading, refetch } = useApi(fetcher, [id])

  if (loading) return <LoadingState label="Loading material…" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />
  if (!m) return null

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Materials', to: '/materials' },
          { label: m.existing_material_code || m.material_description || 'Material' },
        ]}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <Link to="/compare" state={{ preselectA: m.id }}>
          <Button variant="primary" size="sm" icon={GitCompareArrows}>
            Compare this material
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-ink-900">
          {m.standardized_description || m.material_description}
        </h1>
        <p className="text-sm text-ink-500 font-mono mt-0.5">
          {m.source_cpse} · {m.existing_material_code}
        </p>
      </div>

      <DetailSection title="Identity">
        <Field label="Source CPSE" value={m.source_cpse} />
        <Field label="Existing material code" value={m.existing_material_code} mono />
        <Field label="Source ERP" value={m.source_erp} />
        <Field label="Source document" value={m.source_document} />
        <Field label="Material status" value={m.material_status} />
        <Field label="National Material Code" value={m.national_material_code} mono />
      </DetailSection>

      <DetailSection title="Technical Attributes">
        <Field label="Material type" value={m.material_type} />
        <Field label="Grade" value={m.grade} />
        <Field label="Standard" value={m.standard} />
        <Field label="Thread type" value={m.thread_type} />
        <Field label="Connection type" value={m.connection_type} />
        <Field label="Pressure rating" value={m.pressure_rating} />
        <Field label="Unit of measure" value={m.unit_of_measure} />
      </DetailSection>

      <DetailSection title="Dimensions">
        <Field label="Diameter" value={m.diameter != null ? fmtDimension(m.diameter) : null} />
        <Field label="Length" value={m.length != null ? fmtDimension(m.length) : null} />
        <Field label="Width" value={m.width != null ? fmtDimension(m.width) : null} />
        <Field label="Height" value={m.height != null ? fmtDimension(m.height) : null} />
        <Field label="Weight" value={m.weight != null ? fmtDimension(m.weight, 'kg') : null} />
      </DetailSection>

      <DetailSection title="Commercial Information">
        <Field label="Manufacturer" value={m.manufacturer} />
        <Field label="Supplier" value={m.supplier} />
        <Field
          label="Historical price"
          value={m.historical_price != null ? `${m.historical_price} ${m.currency || ''}`.trim() : null}
        />
        <Field label="Procurement quantity" value={m.procurement_quantity} />
        <Field label="Purchase order number" value={m.purchase_order_number} mono />
        <Field label="Procurement date" value={m.procurement_date ? fmtDateTime(m.procurement_date) : null} />
      </DetailSection>

      <DetailSection title="Classification">
        <Field label="Category" value={m.category} />
        <Field label="Subcategory" value={m.subcategory} />
        <Field label="Specification" value={m.specification} />
        <Field label="Industry" value={m.industry} />
        <Field label="Department" value={m.department} />
        <Field label="UNSPSC code" value={m.unspsc_code} mono />
        <Field label="CPSE classification code" value={m.cpse_classification_code} mono />
      </DetailSection>

      <DetailSection title="Standardization">
        <Field label="Standardized description" value={m.standardized_description} />
        <Field label="Standardized category" value={m.standardized_category} />
        <Field label="Standardized subcategory" value={m.standardized_subcategory} />
        <Field label="Standardized specification" value={m.standardized_specification} />
      </DetailSection>

      <DetailSection title="National Code">
        <Field label="National Material Code" value={m.national_material_code} mono />
        <Field label="Cluster ID" value={m.cluster_id} mono />
      </DetailSection>

      <DetailSection title="Metadata">
        <Field label="Created" value={fmtDateTime(m.created_date)} />
        <Field label="Last modified" value={fmtDateTime(m.last_modified_date)} />
      </DetailSection>
    </div>
  )
}
