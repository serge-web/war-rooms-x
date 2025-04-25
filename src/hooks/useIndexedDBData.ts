// useIndexedDBData.ts
import { useState, useEffect } from 'react'
import localforage from 'localforage'

export function useIndexedDBData<T>(resourceName: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await localforage.getItem<T>(`ra-data-local-forage-${resourceName}`)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resourceName])

  return { data, loading, error }
}