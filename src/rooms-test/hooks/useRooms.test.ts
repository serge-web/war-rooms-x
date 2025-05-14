import { renderHook, waitFor } from '@testing-library/react'
import { useRooms } from '../../components/PlayerView/Rooms/RoomsList/useRooms'
import { XMPPService } from '../../services/xmpp'

// Mock useIndexedDBData to avoid localforage issues
const mockUseIndexedDBData = jest.fn()
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: () => mockUseIndexedDBData()
}))

describe('useRooms hook', () => {
  // Mock XMPP client methods
  const mockListRooms = jest.fn()
  const mockGetDiscoInfo = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array when waiting for login', () => {   
    // Mock useIndexedDBData to return a default value
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms(null, null))
    
    // Verify initial state is empty array
    expect(result.current.rooms).toEqual([])
  })

  it('should filter rooms for regular user with mock data', () => {
    // Mock data for a regular user
    const mockRooms = [
      { 
        id: 'room1', 
        name: 'Room 1', 
        memberForces: ['test-force', 'force2'],
        members: ['test-user', 'user2']
      },
      { 
        id: 'room2', 
        name: 'Room 2', 
        memberForces: ['force2', 'force3'],
        members: ['user2', 'user3'] 
      },
      { 
        id: 'room3', 
        name: 'Room 3', 
        memberForces: ['test-force', 'force3'],
        members: ['test-user', 'user3'] 
      },
      { 
        id: '__admin', 
        name: 'Admin Room', 
        memberForces: ['force4'],
        members: ['admin'] 
      }
    ]

    mockUseIndexedDBData.mockReturnValue({
      data: mockRooms,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms(null, { playerId: 'test-user', forceId: 'test-force' }))
    
    // Verify rooms are filtered correctly for the user
    expect(result.current.rooms).toHaveLength(3) // Should include room1, room3, and __admin
    
    // Check that the correct rooms are included
    const roomIds = result.current.rooms.map(room => room.roomName)
    expect(roomIds).toContain('room1')
    expect(roomIds).toContain('room3')
    expect(roomIds).toContain('__admin')
    expect(roomIds).not.toContain('room2')
    
    // Verify room data is correctly transformed
    const room1 = result.current.rooms.find(room => room.roomName === 'room1')
    expect(room1).toHaveProperty('roomName', 'room1')
    expect(room1).toHaveProperty('naturalName', 'Room 1')
    expect(room1).toHaveProperty('description')
  })

  it('should include all rooms for admin user with mock data', () => {
    // Mock data for admin user
    const mockRooms = [
      { 
        id: 'room1', 
        name: 'Room 1', 
        memberForces: ['force1'],
        members: ['user1'] 
      },
      { 
        id: 'room2', 
        name: 'Room 2', 
        memberForces: ['force2'],
        members: ['user2'] 
      }
    ]

    mockUseIndexedDBData.mockReturnValue({
      data: mockRooms,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms(null, { playerId: 'admin', forceId: 'admin' }))
    
    // Verify all rooms are included for admin
    expect(result.current.rooms).toHaveLength(2)
    
    // Check that all rooms are included
    const roomIds = result.current.rooms.map(room => room.roomName)
    expect(roomIds).toContain('room1')
    expect(roomIds).toContain('room2')
  })
  
  it('should handle loading state correctly', () => {
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: true
    })

    // Render the hook
    const { result } = renderHook(() => useRooms(null, { playerId: 'test-user', forceId: 'test-force' }))
    
    // Verify empty array is returned during loading
    expect(result.current.rooms).toEqual([])
  })

  it('should handle missing mockPlayerId correctly', () => {
    // Set up mocks for null xmppClient but missing mockPlayerId
    mockUseIndexedDBData.mockReturnValue({
      data: [{ id: 'room1', name: 'Room 1' }],
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms(null, null))
    
    // Verify empty array is returned when mockPlayerId is missing
    expect(result.current.rooms).toEqual([])
  })

  it('should fetch rooms from XMPP client when available', async () => {
    // Mock room data from XMPP server
    const mockXmppRooms = [
      { jid: 'room1@conference.example.com', name: 'Room 1' },
      { jid: 'room2@conference.example.com', name: 'Room 2' }
    ]

    // Mock room info data
    const mockRoomInfos = [
      {
        extensions: [{
          fields: [
            { name: 'muc#roominfo_description', value: 'Description for Room 1' }
          ]
        }]
      },
      {
        extensions: [{
          fields: [
            { name: 'muc#roominfo_description', value: 'Description for Room 2' }
          ]
        }]
      }
    ]

    // Create mock XMPP client
    mockListRooms.mockResolvedValue(mockXmppRooms)
    mockGetDiscoInfo.mockImplementation((jid) => {
      if (jid === 'room1@conference.example.com') {
        return Promise.resolve(mockRoomInfos[0])
      } else {
        return Promise.resolve(mockRoomInfos[1])
      }
    })

    const mockXmppClient = {
      mucServiceUrl: 'conference.example.com',
      listRooms: mockListRooms,
      client: {
        getDiscoInfo: mockGetDiscoInfo
      }
    }
    // Render the hook
    const { result } = renderHook(() => useRooms(mockXmppClient as unknown as XMPPService, { playerId: 'test-user', forceId: 'test-force'}))
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockListRooms).toHaveBeenCalled()
    })

    // Verify rooms are fetched from XMPP client
    await waitFor(() => {
      expect(result.current.rooms).toHaveLength(2)
    })

    // Verify room data is correctly transformed
    await waitFor(() => {
      const roomIds = result.current.rooms.map(room => room.roomName)
      expect(roomIds).toContain('room1@conference.example.com')
      expect(roomIds).toContain('room2@conference.example.com')

      const room1 = result.current.rooms.find(room => room.roomName === 'room1@conference.example.com')
      expect(room1).toHaveProperty('naturalName', 'Room 1')
      expect(room1).toHaveProperty('description', 'Description for Room 1')

      const room2 = result.current.rooms.find(room => room.roomName === 'room2@conference.example.com')
      expect(room2).toHaveProperty('naturalName', 'Room 2')
      expect(room2).toHaveProperty('description', 'Description for Room 2')
    }, { timeout: 1000 })
  })
})
