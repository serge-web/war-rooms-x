import { renderHook, waitFor } from '@testing-library/react'
import { FORCES_PREFIX, USERS_PREFIX } from '../../types/constants'

// Mock dependencies
jest.mock('../../components/AdminView/raHelpers', () => ({
  trimHost: (jid: string | undefined) => jid ? jid.split('@')[0] : ''
}))

// Import the hook after mocking
import { usePlayerDetails } from '../../components/PlayerView/UserDetails/usePlayerDetails'
import { ForceConfigType, UserConfigType } from '../../types/wargame-d'

// Mock XMPPService
jest.mock('../../services/XMPPService', () => ({
  XMPPService: jest.fn().mockImplementation(() => ({
    bareJid: 'test-user@example.com',
    getJID: jest.fn().mockReturnValue('test-user@example.com'),
    isConnected: jest.fn().mockReturnValue(true),
    getPubSubDocument: jest.fn(),
  }))
}))

// Import XMPPService after mocking
import { XMPPService } from '../../services/XMPPService'

describe('usePlayerDetails hook', () => {
  // Mock data
  const mockUser: UserConfigType = {
    type: 'user-config-type-v1',
    name: 'Test User',
    forceId: 'test-force'
  }

  const mockForce: ForceConfigType = {
    type: 'force-config-type-v1',
    id: 'test-force',
    name: 'Test Force',
    objectives: 'Test objectives',
    color: '#ff0000'
  }

  // Create mock XMPP client
  let mockXmppClient: XMPPService
  let mockGetPubSubDocument: jest.Mock

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create a new instance of the mock XMPPService
    mockXmppClient = new XMPPService()
    
    // Set up mock for getPubSubDocument
    mockGetPubSubDocument = mockXmppClient.getPubSubDocument as jest.Mock
    mockGetPubSubDocument.mockImplementation((nodeId: string) => {
      if (nodeId.includes(USERS_PREFIX)) {
        return Promise.resolve(mockUser)
      } else if (nodeId.includes(FORCES_PREFIX)) {
        return Promise.resolve(mockForce)
      }
      return Promise.resolve(null)
    })
  })

  it('should load player details from XMPP client', async () => {
    // Render the hook
    const { result } = renderHook(() => usePlayerDetails(mockXmppClient))
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(result.current.playerDetails).not.toBeNull()
    })
    
    // Verify player details are loaded from XMPP
    expect(result.current.playerDetails).toEqual({
      id: 'test-user',
      role: 'Test User',
      forceId: 'test-force',
      forceName: 'Test Force',
      forceObjectives: 'Test objectives',
      color: '#ff0000'
    })
    
    // Verify the getPubSubDocument was called with the correct arguments
    expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
    expect(mockGetPubSubDocument).toHaveBeenCalledWith(FORCES_PREFIX + 'test-force')
  })

  it('should handle missing force data', async () => {
    // Setup mock to return a user without a force
    mockGetPubSubDocument.mockImplementation((nodeId: string) => {
      if (nodeId.includes(USERS_PREFIX)) {
        return Promise.resolve({
          ...mockUser,
          forceId: null
        })
      }
      return Promise.resolve(null)
    })
    
    // Render the hook
    const { result } = renderHook(() => usePlayerDetails(mockXmppClient))
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(result.current.playerDetails).not.toBeNull()
    })
    
    // Verify player details are loaded with default values for force
    expect(result.current.playerDetails).toEqual({
      id: 'test-user',
      role: 'Test User',
      forceId: '',
      forceName: '',
      forceObjectives: '',
      color: undefined
    })
    
    // Verify the getPubSubDocument was called with the correct arguments
    expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
    // Should not call for force document since forceId is null
    expect(mockGetPubSubDocument).not.toHaveBeenCalledWith(expect.stringContaining(FORCES_PREFIX))
  })
})
