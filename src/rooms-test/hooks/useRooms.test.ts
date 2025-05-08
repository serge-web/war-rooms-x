import { renderHook } from '@testing-library/react'
import { useRooms } from '../../components/PlayerView/Rooms/RoomsList/useRooms'

// Mock the WargameContext to control xmppClient value
const mockUseWargame = jest.fn()
jest.mock('../../contexts/WargameContext', () => ({
  useWargame: () => mockUseWargame()
}))

// Mock useIndexedDBData to avoid localforage issues
const mockUseIndexedDBData = jest.fn()
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: () => mockUseIndexedDBData()
}))

describe('useRooms hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array when waiting for login', () => {
    // Mock undefined xmppClient (waiting for login state)
    mockUseWargame.mockReturnValue({
      xmppClient: undefined
    })
    
    // Mock useIndexedDBData to return a default value
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms())
    
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

    // Set up mocks for null xmppClient and mock data
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      mockPlayerId: { playerId: 'test-user', forceId: 'test-force' }
    })

    mockUseIndexedDBData.mockReturnValue({
      data: mockRooms,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms())
    
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

    // Set up mocks for null xmppClient and admin user
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      mockPlayerId: { playerId: 'admin', forceId: 'admin' }
    })

    mockUseIndexedDBData.mockReturnValue({
      data: mockRooms,
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms())
    
    // Verify all rooms are included for admin
    expect(result.current.rooms).toHaveLength(2)
    
    // Check that all rooms are included
    const roomIds = result.current.rooms.map(room => room.roomName)
    expect(roomIds).toContain('room1')
    expect(roomIds).toContain('room2')
  })
  
  it('should handle loading state correctly', () => {
    // Set up mocks for null xmppClient and loading state
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      mockPlayerId: { playerId: 'test-user', forceId: 'test-force' }
    })

    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: true
    })

    // Render the hook
    const { result } = renderHook(() => useRooms())
    
    // Verify empty array is returned during loading
    expect(result.current.rooms).toEqual([])
  })

  it('should handle missing mockPlayerId correctly', () => {
    // Set up mocks for null xmppClient but missing mockPlayerId
    mockUseWargame.mockReturnValue({
      xmppClient: null,
      mockPlayerId: null
    })

    mockUseIndexedDBData.mockReturnValue({
      data: [{ id: 'room1', name: 'Room 1' }],
      loading: false
    })

    // Render the hook
    const { result } = renderHook(() => useRooms())
    
    // Verify empty array is returned when mockPlayerId is missing
    expect(result.current.rooms).toEqual([])
  })
})
