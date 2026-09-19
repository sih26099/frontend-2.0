import { useEffect, useRef, useState } from 'react'
import { checkApiHealth } from '../services/api'

const POLL_INTERVAL_MS = 30000

export function useApiHealth() {
  const [status, setStatus] = useState('checking') // 'checking' | 'connected' | 'offline'
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const probe = () => {
      checkApiHealth()
        .then(() => {
          if (mounted.current) setStatus('connected')
        })
        .catch(() => {
          if (mounted.current) setStatus('offline')
        })
    }

    probe()
    const interval = setInterval(probe, POLL_INTERVAL_MS)
    return () => {
      mounted.current = false
      clearInterval(interval)
    }
  }, [])

  return status
}
