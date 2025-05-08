import { renderHook, act } from '@testing-library/react'
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
    
    // Verify initial state
    expect(result.current.messages).toEqual([])
    expect(result.current.users).toEqual([])
    expect(result.current.theme).toBeUndefined()
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.error).toBeNull()
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
        dummyMessages: mockMessages,
        dummyTheme: { token: { colorPrimary: '#ff0000' } }
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
    
    // Verify all properties are loaded from mock data
    expect(result.current.messages).toEqual(mockMessages)
    expect(result.current.theme).toEqual({ token: { colorPrimary: '#ff0000' } })
    expect(result.current.users).toEqual([])
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.error).toBeNull()
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
    
    // Verify all properties during loading state
    expect(result.current.messages).toEqual([])
    expect(result.current.users).toEqual([])
    expect(result.current.theme).toBeUndefined()
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.error).toBeNull()
  })
  
  it('should add message to local state when sending message with null xmppClient', () => {
    // Create empty mock room data
    const mockRooms = [
      {
        id: 'test-room',
        name: 'Test Room',
        dummyMessages: []
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
    
    // Verify initial state
    expect(result.current.messages).toEqual([])
    
    // Send a message - wrap in act() to handle state updates
    act(() => {
      result.current.sendMessage('chat', { text: 'Test message' })
    })
    
    // Verify message was added to local state
    expect(result.current.messages.length).toBe(1)
    expect(result.current.messages[0].details.messageType).toBe('chat')
    expect(result.current.messages[0].content).toEqual({ text: 'Test message' })
    expect(result.current.messages[0].details.senderId).toBe('test-user')
    expect(result.current.messages[0].details.senderForce).toBe('test-force')
  })
  
  it('should have empty users array when xmppClient is null', () => {
    // Create mock room data with theme but no users
    // Note: Based on the implementation, users are only set when using XMPP client, not from mock data
    const mockRooms = [
      {
        id: 'test-room',
        name: 'Test Room',
        dummyMessages: [],
        dummyTheme: { token: { colorPrimary: '#ff0000' } }
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
    
    // Verify users array is empty (not loaded from mock data)
    expect(result.current.users).toEqual([])
    // But theme should be loaded from mock data
    expect(result.current.theme).toEqual({ token: { colorPrimary: '#ff0000' } })
  })
})
