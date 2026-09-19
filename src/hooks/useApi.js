import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic data-fetching hook: runs `fetcher` (a function returning a
 * promise from an axios call in services/api.js), tracks loading / error /
 * data state, and exposes `refetch` for retry buttons. `deps` re-runs the
 * fetch when any dependency changes, mirroring useEffect's dependency array.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const run = useCallback(() => {
    const currentId = ++requestId.current
    setLoading(true)
    setError(null)
    fetcher()
      .then((response) => {
        if (currentId !== requestId.current) return
        setData(response.data)
      })
      .catch((err) => {
        if (currentId !== requestId.current) return
        setError(err)
      })
      .finally(() => {
        if (currentId !== requestId.current) return
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, error, loading, refetch: run }
}
