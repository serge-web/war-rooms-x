import { renderHook, waitFor } from '@testing-library/react'
import { useIndexedDBData } from '../../hooks/useIndexedDBData'
import { prefixKey } from '../../types/constants'

// Mock localforage
jest.mock('localforage', () => ({
  keys: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn()
}))

// Mock mockBackend
jest.mock('../../mockData/mockAdmin', () => ({
  mockBackend: {
    testResource: [{ id: 'test1', name: 'Test Item 1' }],
    chatrooms: [
      { id: 'room1', name: 'Room 1' },
      { id: 'room2', name: 'Room 2' }
    ]
  }
}))

// Import mocked modules
import * as localforage from 'localforage'

describe('useIndexedDBData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for keys
    ;(localforage.keys as jest.Mock).mockResolvedValue([])
  })

  it('should initialize data store if no data exists', async () => {
    // Mock keys to return empty array (no data exists)
    ;(localforage.keys as jest.Mock).mockResolvedValue([])
    
    // Mock getItem to return test data
    ;(localforage.getItem as jest.Mock).mockResolvedValue([{ id: 'test1', name: 'Test Item 1' }])
    
    // Render the hook
    const { result } = renderHook(() => useIndexedDBData('testResource'))
    
    // Initially loading should be true and data should be null
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Verify initialization was attempted
    expect(localforage.keys).toHaveBeenCalled()
    expect(localforage.setItem).toHaveBeenCalled()
    
    // Verify data was fetched
    expect(localforage.getItem).toHaveBeenCalledWith(`${prefixKey}testResource`)
    
    // Verify data
    expect(result.current.data).toEqual([{ id: 'test1', name: 'Test Item 1' }])
  })

  it('should not initialize data store if data already exists', async () => {
    // Mock keys to return existing keys
    ;(localforage.keys as jest.Mock).mockResolvedValue([`${prefixKey}testResource`])
    
    // Mock getItem to return test data
    ;(localforage.getItem as jest.Mock).mockResolvedValue([{ id: 'test1', name: 'Test Item 1' }])
    
    // Render the hook
    const { result } = renderHook(() => useIndexedDBData('testResource'))
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Verify initialization was checked but not performed
    expect(localforage.keys).toHaveBeenCalled()
    expect(localforage.setItem).not.toHaveBeenCalled()
    
    // Verify data was fetched
    expect(localforage.getItem).toHaveBeenCalledWith(`${prefixKey}testResource`)
    
    // Verify data
    expect(result.current.data).toEqual([{ id: 'test1', name: 'Test Item 1' }])
  })

  it('should handle errors during data fetching', async () => {
    // Mock keys to throw an error
    ;(localforage.keys as jest.Mock).mockRejectedValue(new Error('Test error'))
    
    // Render the hook
    const { result } = renderHook(() => useIndexedDBData('testResource'))
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Verify error state
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Test error')
    expect(result.current.data).toBeNull()
  })

  it('should update when resource name changes', async () => {
    // Mock getItem to return different data based on resource name
    ;(localforage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === `${prefixKey}testResource`) {
        return Promise.resolve([{ id: 'test1', name: 'Test Item 1' }])
      } else if (key === `${prefixKey}chatrooms`) {
        return Promise.resolve([
          { id: 'room1', name: 'Room 1' },
          { id: 'room2', name: 'Room 2' }
        ])
      }
      return Promise.resolve(null)
    })
    
    // Render the hook with initial resource
    const { result, rerender } = renderHook(
      ({ resourceName }) => useIndexedDBData(resourceName),
      { initialProps: { resourceName: 'testResource' } }
    )
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Verify initial data
    expect(result.current.data).toEqual([{ id: 'test1', name: 'Test Item 1' }])
    
    // Rerender with different resource
    rerender({ resourceName: 'chatrooms' })
    
    // Wait for the effect to complete again
    await waitFor(() => {
      expect(localforage.getItem).toHaveBeenCalledWith(`${prefixKey}chatrooms`)
    })
    
    // Verify data was updated
    expect(result.current.data).toEqual([
      { id: 'room1', name: 'Room 1' },
      { id: 'room2', name: 'Room 2' }
    ])
  })
})
