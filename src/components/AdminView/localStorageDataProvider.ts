import localForageDataProvider from 'ra-data-local-forage'
import { mockBackend } from '../../mockData/mockAdmin'

// Initialize the data provider with our mock data
const initializeLocalForageDataProvider = async () => {
  const dataProvider = localForageDataProvider({
    defaultData: mockBackend,
    loggingEnabled: process.env.NODE_ENV === 'development'
  })

  return dataProvider
}

export default initializeLocalForageDataProvider
