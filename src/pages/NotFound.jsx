import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
      <h1 className="text-lg font-semibold text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-sm text-signal-info hover:underline">
        Return to dashboard
      </Link>
    </div>
  )
}
