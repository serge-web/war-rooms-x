import localForageDataProvider from 'ra-data-local-forage'
import { mockBackend } from '../../mockData/mockAdmin'
import localforage from 'localforage'
import { prefixKey } from '../../types/constants'

// Initialize the data provider with our mock data
const initializeLocalForageDataProvider = async () => {
  // First, check if we need to initialize the data store
  await initializeDataStoreIfNeeded()
  
  // Then initialize the data provider with the default data
  const dataProvider = localForageDataProvider({
    defaultData: mockBackend,
    loggingEnabled: process.env.NODE_ENV === 'development'
  })

  return dataProvider
}

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

export default initializeLocalForageDataProvider
