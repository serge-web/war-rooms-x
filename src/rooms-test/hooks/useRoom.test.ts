import { renderHook } from '@testing-library/react'
import { RoomType } from '../../types/rooms-d'

// Mock the WargameContext
const mockUseWargame = jest.fn()
jest.mock('../../contexts/WargameContext', () => ({
  useWargame: () => mockUseWargame()
}))

// Mock useIndexedDBData
const mockUseIndexedDBData = jest.fn()
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: () => mockUseIndexedDBData()
}))

// Mock localforage
jest.mock('localforage')

// Import the actual hook we're testing
import { useRoom } from '../../components/PlayerView/Rooms/useRoom'

describe('useRoom hook', () => {
  // Sample room data for testing
  const testRoom: RoomType = {
    roomName: 'test-room',
    naturalName: 'Test Room',
    description: 'A test room for unit testing'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    })
  })

  it('should return empty messages array when waiting for login', () => {
    // Mock undefined xmppClient (waiting for login state)
    mockUseWargame.mockReturnValue({
      xmppClient: undefined,
      gameState: null,
      playerDetails: null
    })
    
    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Just verify the messages array is empty
    expect(result.current.messages).toEqual([])
  })
  
  it('should load mock messages when xmppClient is null', () => {
    // Create mock room data with messages
    const mockMessages = [
      {
        id: 'msg-1',
        details: {
          messageType: 'chat',
          senderId: 'user1',
          senderName: 'User 1',
          senderForce: 'force1',
          turn: '1',
          phase: 'planning',
          timestamp: '2023-01-01T00:00:00.000Z',
          channel: 'test-room'
        },
        content: { text: 'Hello world' }
      }
    ]
    
    const mockRooms = [
      {
        id: 'test-room',
        name: 'Test Room',
        dummyMessages: mockMessages
      }
    ]
    
    // Set up mocks for null xmppClient and mock data
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' }
    })

    mockUseIndexedDBData.mockReturnValue({
      data: mockRooms,
      loading: false,
      error: null
    })

    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Verify messages are loaded from mock data
    expect(result.current.messages).toEqual(mockMessages)
  })
  
  it('should return empty messages array when loading', () => {
    // Set up mocks for null xmppClient and loading state
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      gameState: null,
      playerDetails: null
    })

    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: true,
      error: null
    })

    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Verify messages array is empty during loading
    expect(result.current.messages).toEqual([])
  })
})
