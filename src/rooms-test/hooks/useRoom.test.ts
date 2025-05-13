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
const mockSetItem = jest.fn()
jest.mock('localforage', () => ({
  setItem: (key: string, value: unknown) => mockSetItem(key, value)
}))

// Import the actual hook we're testing
import { useRoom } from '../../components/PlayerView/Rooms/useRoom'

describe('useRoom hook', () => {
  // Sample room data for testing
  const testRoom: RoomType = {
    roomName: 'test-room',
    naturalName: 'Test Room',
    description: 'A test room for unit testing'
  }

  // Mock users to be returned from getRoomMembers
  const mockUsers = [
    { jid: 'user1', name: 'User 1', role: 'Player', forceId: 'force1' },
    { jid: 'user2', name: 'User 2', role: 'Admin', forceId: 'force2' }
  ]
  
  // Mock XMPP client methods
  const mockJoinRoom = jest.fn()
  const mockGetRoomMembers = jest.fn().mockResolvedValue(mockUsers)
  const mockSendRoomMessage = jest.fn()
  const mockLeaveRoom = jest.fn()
  const mockSubscribeToPresence = jest.fn()

  // Mock XMPP client
  const createMockXmppClient = (includeServices = true) => ({
    joinRoom: mockJoinRoom,
    getRoomMembers: mockGetRoomMembers,
    sendRoomMessage: mockSendRoomMessage,
    leaveRoom: mockLeaveRoom,
    subscribeToPresence: mockSubscribeToPresence,
    mucService: includeServices ? {} : null
  })

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    })

    // Reset XMPP client method mocks
    mockJoinRoom.mockReset().mockResolvedValue( [
      {
        "forceId": "force1",
        "id": "user1",
        "name": "User 1",
        "role": "Player",
      },
     {
        "forceId": "force2",
        "id": "user2",
        "name": "User 2",
        "role": "Admin",
      }])
    mockGetRoomMembers.mockReset().mockResolvedValue([])
    mockSendRoomMessage.mockReset().mockResolvedValue({ success: true })
    mockLeaveRoom.mockReset().mockResolvedValue(undefined)
    mockSubscribeToPresence.mockReset().mockResolvedValue(undefined)
  })

  const mockGetPlayerDetails = jest.fn().mockImplementation((id: string) => {
    return mockUsers.find(u => u.jid === id)
  })

  it('should return empty messages array when waiting for login', () => {
    // Mock undefined xmppClient (waiting for login state)
    mockUseWargame.mockReturnValue({
      xmppClient: undefined,
      gameState: null,
      playerDetails: null,
      getPlayerDetails: mockGetPlayerDetails
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
        dummyUsers: mockUsers,
        dummyTheme: { token: { colorPrimary: '#ff0000' } }
      }
    ]
    
    // Set up mocks for null xmppClient and mock data
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
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
    expect(result.current.users).toEqual(mockUsers)
    expect(result.current.canSubmit).toBe(true)
    expect(result.current.error).toBeNull()
  })
  
  it('should return empty messages array when loading', () => {
    // Set up mocks for null xmppClient and loading state
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      gameState: null,
      playerDetails: null,
      getPlayerDetails: mockGetPlayerDetails
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
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
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
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
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

  it('should join room and fetch users when xmppClient is available', async () => {
    
    // Set up mock for XMPP client
    mockGetRoomMembers.mockResolvedValue(mockUsers)
    
    // Set up mocks for active xmppClient
    mockUseWargame.mockReturnValue({
      xmppClient: createMockXmppClient(),
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
    })

    // Render the hook
    const { result, rerender } = renderHook(() => useRoom(testRoom))
    
    // Verify initial state
    expect(result.current.users).toEqual([])
    
    // Wait for async operations to complete
    await act(async () => {
      // Manually trigger the promises to resolve
      await Promise.resolve()
      await Promise.resolve()
    })
    
    // Force a re-render to get the updated state
    rerender()

    const mappedUsers = mockUsers.map(u => ({
      force: u.forceId,
      id: u.jid,
      isOnline: true,
      name: u.name
    }))
    
    // Verify room was joined and users were fetched
    expect(mockJoinRoom).toHaveBeenCalledWith('test-room', expect.any(Function))
    expect(mockGetRoomMembers).toHaveBeenCalledWith('test-room')
    expect(result.current.users).toEqual(mappedUsers)
  })

  it('should send message through XMPP client when available', async () => {
    // Set up mocks for active xmppClient
    mockUseWargame.mockReturnValue({
      xmppClient: createMockXmppClient(),
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
    })

    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Send a message
    await act(async () => {
      result.current.sendMessage('chat', { text: 'Test message via XMPP' })
      // Wait for async operations
      await Promise.resolve()
    })
    
    // Verify message was sent via XMPP client
    expect(mockSendRoomMessage).toHaveBeenCalledWith(expect.objectContaining({
      details: expect.objectContaining({
        messageType: 'chat',
        senderId: 'test-user',
        senderForce: 'test-force',
        channel: 'test-room'
      }),
      content: { text: 'Test message via XMPP' }
    }))
  })

  it('should handle error when sending message fails', async () => {
    // Mock sendRoomMessage to return error
    mockSendRoomMessage.mockResolvedValue({ 
      success: false, 
      error: 'Failed to send message' 
    })
    
    // Set up mocks for active xmppClient
    mockUseWargame.mockReturnValue({
      xmppClient: createMockXmppClient(),
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
    })

    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Verify initial error state
    expect(result.current.error).toBeNull()
    
    // Send a message that will fail
    await act(async () => {
      result.current.sendMessage('chat', { text: 'This message will fail' })
      // Wait for async operations
      await Promise.resolve()
    })
    
    // Verify error was set
    expect(result.current.error).toEqual({
      title: 'Message sending error',
      message: 'Error sending message:Failed to send message'
    })
    
    // Test clearError function
    act(() => {
      result.current.clearError()
    })
    
    // Verify error was cleared
    expect(result.current.error).toBeNull()
  })

  it('should handle incoming messages from XMPP', async () => {
    // Prepare to capture the message handler function
    let capturedMessageHandler: ((message: { body?: string }) => void) | null = null
    mockJoinRoom.mockImplementation((_roomName: string, handler: (message: { body?: string }) => void) => {
      capturedMessageHandler = handler
      return Promise.resolve()
    })
    
    // Set up mocks for active xmppClient
    mockUseWargame.mockReturnValue({
      xmppClient: createMockXmppClient(),
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
    })

    // Render the hook
    const { result } = renderHook(() => useRoom(testRoom))
    
    // Wait for joinRoom to be called
    await act(async () => {
      await Promise.resolve()
    })
    
    // Verify initial messages array is empty
    expect(result.current.messages).toEqual([])
    
    // Simulate receiving a message via the captured handler
    await act(async () => {
      if (capturedMessageHandler) {
        const incomingMessage = {
          body: JSON.stringify({
            id: 'incoming-1',
            details: {
              messageType: 'chat',
              senderId: 'other-user',
              senderName: 'Other User',
              senderForce: 'force2',
              turn: '1',
              phase: 'planning',
              timestamp: '2023-01-01T00:00:00.000Z',
              channel: 'test-room'
            },
            content: { text: 'Hello from XMPP' }
          })
        }
        capturedMessageHandler(incomingMessage)
      }
      await Promise.resolve()
    })
    
    // Verify message was added to state
    expect(result.current.messages.length).toBe(1)
    expect(result.current.messages[0].content).toEqual({ text: 'Hello from XMPP' })
    expect(result.current.messages[0].details.senderId).toBe('other-user')
  })

  it('should not join room when mucService is not available', async () => {
    // Set up mocks for xmppClient without mucService
    mockUseWargame.mockReturnValue({
      xmppClient: createMockXmppClient(false),
      gameState: { turn: '1', currentPhase: 'planning' },
      playerDetails: { id: 'test-user', role: 'Player', forceId: 'test-force' },
      getPlayerDetails: mockGetPlayerDetails
    })

    // Render the hook
    renderHook(() => useRoom(testRoom))
    
    // Wait for any async operations
    await act(async () => {
      await Promise.resolve()
    })
    
    // Verify joinRoom was not called
    expect(mockJoinRoom).not.toHaveBeenCalled()
    expect(mockGetRoomMembers).not.toHaveBeenCalled()
  })
})
