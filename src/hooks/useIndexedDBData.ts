// useIndexedDBData.ts
import { useState, useEffect } from 'react'
import localforage from 'localforage'
import { mockBackend } from '../mockData/mockAdmin'

export const prefixKey = 'ra-data-local-forage-'

// Function to check if data store exists and initialize it if needed
const initializeDataStoreIfNeeded = async () => {
  
  // Check if any data exists in the store
  const keys = await localforage.keys()
  const dataExists = keys.some(key => key.startsWith(prefixKey))
  
  // Only initialize with default data if no data exists
  if (!dataExists) {
    // Explicitly type-safe way to iterate through the mockBackend keys
    type BackendKey = keyof typeof mockBackend
    
    // Persist each resource from mockBackend
    for (const resource of Object.keys(mockBackend) as BackendKey[]) {
      await localforage.setItem(`${prefixKey}${resource}`, mockBackend[resource])
    }
  }
}

export function useIndexedDBData<T>(resourceName: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Check and initialize data store if needed
        await initializeDataStoreIfNeeded()
        
        // Then fetch the requested resource
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