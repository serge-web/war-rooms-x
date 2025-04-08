import { renderHook, act } from '@testing-library/react-hooks'
import { useWargame } from '../../hooks/useWargame'
import * as stanza from 'stanza'

// Define a type for our mock client to avoid TypeScript errors
interface MockClient {
  on: jest.Mock
  connect: jest.Mock
  disconnect: jest.Mock
  _pubsubHandlers: Array<(event: Record<string, unknown>) => void>
  pubsub: {
    subscribe: jest.Mock
    getItems: jest.Mock
  }
}

// Mock the stanza client
jest.mock('stanza', () => {
  const mockPubsub = {
    subscribe: jest.fn().mockResolvedValue({}),
    getItems: jest.fn().mockResolvedValue({ items: [] })
  }
  
  const mockClient: Partial<MockClient> = {
    on: jest.fn((event, callback) => {
      if (event === 'pubsub:event') {
        mockClient._pubsubHandlers = mockClient._pubsubHandlers || []
        mockClient._pubsubHandlers.push(callback)
      }
      return mockClient
    }),
    connect: jest.fn(),
    disconnect: jest.fn(),
    _pubsubHandlers: [],
    pubsub: mockPubsub
  }
  
  return {
    createClient: jest.fn((_config = {}) => mockClient as MockClient)
  }
})

describe('useWargame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWargame())
    
    expect(result.current.wargame).toEqual({
      id: '',
      title: '',
      status: 'inactive',
      forces: [],
      currentTurn: 0,
      startTime: null,
      endTime: null
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should subscribe to wargame PubSub node on initialization', () => {
    renderHook(() => useWargame())
    
    const mockClient = stanza.createClient({}) as unknown as MockClient
    expect(mockClient.pubsub.subscribe).toHaveBeenCalledWith('wargame')
  })

  it('should update wargame state when receiving PubSub event', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWargame())
    
    const mockClient = stanza.createClient({}) as unknown as MockClient
    
    // Simulate a PubSub event by calling the first handler directly
    act(() => {
      mockClient._pubsubHandlers[0]({
        type: 'pubsub',
        node: 'wargame',
        items: [{
          content: {
            json: {
              id: 'wg-123',
              title: 'Test Wargame',
              status: 'active',
              forces: [{ id: 'force-1', name: 'Blue Force' }],
              currentTurn: 1,
              startTime: '2025-04-08T08:00:00Z',
              endTime: null
            }
          }
        }]
      })
    })
    
    await waitForNextUpdate()
    
    expect(result.current.wargame).toEqual({
      id: 'wg-123',
      title: 'Test Wargame',
      status: 'active',
      forces: [{ id: 'force-1', name: 'Blue Force' }],
      currentTurn: 1,
      startTime: '2025-04-08T08:00:00Z',
      endTime: null
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle errors when subscribing to PubSub node', async () => {
    // Mock subscription error
    const mockError = new Error('Subscription failed')
    const mockClient = stanza.createClient({}) as unknown as MockClient
    mockClient.pubsub.subscribe.mockRejectedValueOnce(mockError)
    
    const { result, waitForNextUpdate } = renderHook(() => useWargame())
    
    await waitForNextUpdate()
    
    expect(result.current.error).toBe('Failed to subscribe to wargame updates: Subscription failed')
    expect(result.current.isLoading).toBe(false)
  })
})
