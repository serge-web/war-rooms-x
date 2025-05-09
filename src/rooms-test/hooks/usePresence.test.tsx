import { renderHook, act } from '@testing-library/react-hooks'
import { usePresence } from '../../hooks/usePresence'
import { WargameContext } from '../../contexts/WargameContext'
import React from 'react'
import { XMPPService } from '../../services/XMPPService'

// Mock the XMPPService
jest.mock('../../services/XMPPService')

describe('usePresence hook', () => {
  // Mock XMPPService instance
  let mockXmppService: jest.Mocked<XMPPService>
  
  // Mock getPresence function
  const mockGetPresence = jest.fn()
  
  // Mock subscribeToPresence function
  const mockSubscribeToPresence = jest.fn()
  
  // Mock unsubscribe function
  const mockUnsubscribe = jest.fn()
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create a new instance of the mocked XMPPService
    mockXmppService = new XMPPService() as jest.Mocked<XMPPService>
    
    // Mock the getPresence method
    mockXmppService.getPresence = mockGetPresence
    
    // Mock the subscribeToPresence method
    mockXmppService.subscribeToPresence = mockSubscribeToPresence
    
    // Set up the unsubscribe mock
    mockSubscribeToPresence.mockReturnValue(mockUnsubscribe)
  })
  
  // Wrapper component to provide the WargameContext
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WargameContext.Provider
      value={{
        xmppClient: mockXmppService,
        loggedIn: true,
        setXmppClient: jest.fn(),
        raDataProvider: undefined,
        setRaDataProvider: jest.fn(),
        mockPlayerId: null,
        setMockPlayerId: jest.fn(),
        playerDetails: null,
        getForce: jest.fn().mockReturnValue({ id: 'mock-force', name: 'Mock Force' }),
        gameProperties: null,
        gameState: null,
        nextTurn: jest.fn()
      }}
    >
      {children}
    </WargameContext.Provider>
  )
  
  test('should initialize with empty presence map', () => {
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    expect(result.current.presenceMap.size).toBe(0)
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
  })
  
  test('should subscribe to presence updates when roomJid is provided', () => {
    const roomJid = 'room@conference.example.com'
    
    renderHook(() => usePresence(roomJid), { wrapper })
    
    expect(mockSubscribeToPresence).toHaveBeenCalledWith(roomJid, expect.any(Function))
  })
  
  test('should unsubscribe from presence updates on unmount', () => {
    const { unmount } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    unmount()
    
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
  
  test('getUserPresence should fetch presence data from the server', async () => {
    // Mock the getPresence to return a user as available
    mockGetPresence.mockResolvedValue({ available: true })
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    let presenceData
    await act(async () => {
      presenceData = await result.current.getUserPresence('user@example.com')
    })
    
    expect(mockGetPresence).toHaveBeenCalledWith('user@example.com')
    expect(presenceData).toEqual({ available: true })
    
    // The presence map should be updated
    expect(result.current.presenceMap.get('user@example.com')?.available).toBe(true)
  })
  
  test('isUserOnline should return false for unknown users', () => {
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    expect(result.current.isUserOnline('unknown@example.com')).toBe(false)
  })
  
  test('isUserOnline should return correct status for known users', async () => {
    // Mock the getPresence to return a user as available
    mockGetPresence.mockResolvedValue({ available: true })
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    await act(async () => {
      await result.current.getUserPresence('user1@example.com')
    })
    
    // Now mock a different user as unavailable
    mockGetPresence.mockResolvedValue({ available: false })
    
    await act(async () => {
      await result.current.getUserPresence('user2@example.com')
    })
    
    expect(result.current.isUserOnline('user1@example.com')).toBe(true)
    expect(result.current.isUserOnline('user2@example.com')).toBe(false)
  })
  
  test('getOnlineUsers should return all online users', async () => {
    // Mock the getPresence to return users with different statuses
    mockGetPresence.mockImplementation(async (jid) => {
      if (jid === 'user1@example.com' || jid === 'user3@example.com') {
        return { available: true }
      }
      return { available: false }
    })
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    await act(async () => {
      await result.current.getUserPresence('user1@example.com')
      await result.current.getUserPresence('user2@example.com')
      await result.current.getUserPresence('user3@example.com')
    })
    
    const onlineUsers = result.current.getOnlineUsers()
    
    expect(onlineUsers).toHaveLength(2)
    expect(onlineUsers).toContain('user1@example.com')
    expect(onlineUsers).toContain('user3@example.com')
    expect(onlineUsers).not.toContain('user2@example.com')
  })
  
  test('should handle presence updates through subscription', async () => {
    // Capture the presence handler when subscribeToPresence is called
    let capturedHandler: ((jid: string, available: boolean) => void) | null = null
    mockSubscribeToPresence.mockImplementation((_roomJid, handler) => {
      capturedHandler = handler
      return mockUnsubscribe
    })
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    // Ensure the handler was captured
    expect(capturedHandler).not.toBeNull()
    
    // Simulate a presence update
    await act(async () => {
      if (capturedHandler) {
        capturedHandler('user1@example.com', true)
      }
    })
    
    // Check that the presence map was updated
    expect(result.current.isUserOnline('user1@example.com')).toBe(true)
    
    // Simulate another presence update for the same user
    await act(async () => {
      if (capturedHandler) {
        capturedHandler('user1@example.com', false)
      }
    })
    
    // Check that the presence map was updated again
    expect(result.current.isUserOnline('user1@example.com')).toBe(false)
  })
  
  test('should handle errors when getting presence', async () => {
    // Mock getPresence to throw an error
    mockGetPresence.mockRejectedValue(new Error('Failed to get presence'))
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    let presenceData
    await act(async () => {
      presenceData = await result.current.getUserPresence('user@example.com')
    })
    
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled()
    
    // Default to unavailable on error
    expect(presenceData).toEqual({ available: false })
    
    // Restore console.error
    consoleSpy.mockRestore()
  })
  
  test('should handle errors when subscribing to presence', () => {
    // Mock subscribeToPresence to throw an error
    mockSubscribeToPresence.mockImplementation(() => {
      throw new Error('Failed to subscribe')
    })
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper })
    
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled()
    
    // Error state should be set
    expect(result.current.error).toBe('Failed to subscribe to presence updates')
    expect(result.current.loading).toBe(false)
    
    // Restore console.error
    consoleSpy.mockRestore()
  })
  
  test('should handle mock mode (xmppClient === null)', () => {
    // Create a wrapper with xmppClient set to null (mock mode)
    const mockWrapper = ({ children }: { children: React.ReactNode }) => (
      <WargameContext.Provider
        value={{
          xmppClient: null,
          loggedIn: true,
          setXmppClient: jest.fn(),
          raDataProvider: undefined,
          setRaDataProvider: jest.fn(),
          mockPlayerId: null,
          setMockPlayerId: jest.fn(),
          playerDetails: null,
          getForce: jest.fn().mockReturnValue({ id: 'mock-force', name: 'Mock Force' }),
          gameProperties: null,
          gameState: null,
          nextTurn: jest.fn()
        }}
      >
        {children}
      </WargameContext.Provider>
    )
    
    const { result } = renderHook(() => usePresence('room@conference.example.com'), { wrapper: mockWrapper })
    
    // In mock mode, loading should be set to false
    expect(result.current.loading).toBe(false)
    
    // subscribeToPresence should not be called in mock mode
    expect(mockSubscribeToPresence).not.toHaveBeenCalled()
  })
})
