import { CheckCircle2, XCircle } from 'lucide-react'
import { titleCase, fmt } from '../../lib/formatters'

export default function AttributeComparisonTable({ comparisons }) {
  if (!comparisons || comparisons.length === 0) {
    return <div className="text-sm text-ink-400 py-3">No attribute-level comparison was returned for this pair.</div>
  }

  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Material A</th>
            <th>Material B</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((c) => (
            <tr key={c.attribute} className={c.critical && !c.match ? 'bg-signal-conflictBg' : ''}>
              <td className="font-medium">
                {titleCase(c.attribute)}
                {c.critical && <span className="ml-1.5 text-[0.65rem] text-signal-conflict align-middle">critical</span>}
              </td>
              <td className="font-mono">{fmt(c.value_a)}</td>
              <td className="font-mono">{fmt(c.value_b)}</td>
              <td>
                {c.match ? (
                  <span className="inline-flex items-center gap-1 text-signal-good text-xs font-medium">
                    <CheckCircle2 size={13} /> Match
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-signal-bad text-xs font-medium">
                    <XCircle size={13} /> {c.critical ? 'Conflict' : 'Differs'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
