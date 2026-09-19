import ConfidenceBar from '../common/ConfidenceBar'

export default function ScoreBreakdown({ lexical, semantic, technical, final }) {
  return (
    <div className="space-y-3">
      <ConfidenceBar label="Lexical" value={lexical} />
      <ConfidenceBar label="Semantic" value={semantic} />
      <ConfidenceBar label="Technical" value={technical} />
      <div className="border-t border-ink-100 pt-3">
        <ConfidenceBar label="Final" value={final} />
      </div>
      <p className="text-xs text-ink-400">
        Final confidence combines lexical, semantic, and technical similarity using the backend's configured
        weights. The weights themselves aren't exposed by the API, so only the component scores and final result
        are shown here.
      </p>
    </div>
  )
}
