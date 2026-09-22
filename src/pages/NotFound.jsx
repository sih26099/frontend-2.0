import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-28 animate-fade-in-up">
      <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-surface-sunk">
        <Compass size={32} className="text-ink-300" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <div className="text-4xl font-semibold text-ink-200 font-mono tracking-tight">404</div>
        <h1 className="text-lg font-semibold text-ink-900">Page not found</h1>
        <p className="text-sm text-ink-500 max-w-sm">
          The page you're looking for doesn't exist, or may have moved.
        </p>
      </div>
      <Link to="/">
        <Button variant="primary" size="sm" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}