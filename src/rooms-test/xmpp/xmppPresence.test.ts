/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReceivedPresence } from 'stanza/protocol'
import { XMPPService } from '../../services/XMPPService'
import { PresenceHandler } from '../../services/types'
import { PresenceType } from 'stanza/Constants'

// Mock the roomTypeFactory to avoid importing JSX files
jest.mock('../../services/roomTypes', () => ({
  roomTypeFactory: {
    get: jest.fn().mockImplementation((id) => ({
      id,
      label: `Mock Room Type ${id}`,
      description: 'Mock room type for testing',
      isConfigValid: jest.fn().mockReturnValue(true),
      defaultConfig: {},
      showComponent: () => null,
      editComponent: () => null
    })),
    list: jest.fn().mockReturnValue([
      {
        id: 'chat',
        label: 'Chat Room',
        description: 'A room for chat messages',
        isConfigValid: jest.fn().mockReturnValue(true),
        defaultConfig: {},
        showComponent: () => null,
        editComponent: () => null
      }
    ])
  }
}))

describe('XMPPService presence methods', () => {
  let xmppService: XMPPService
  // Mock client type definition
  let mockClient: any
  
  beforeEach(() => {
    // Create a new instance of XMPPService
    xmppService = new XMPPService()
    
    // Create a mock client with proper Jest mock functions
    mockClient = {
      sendPresence: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      listeners: jest.fn().mockReturnValue([])
    }
    
    // Set the mock client
    xmppService.client = mockClient
    
    // Set connected to true
    Object.defineProperty(xmppService, 'connected', {
      value: true,
      writable: true
    })
  })

  describe('subscribeToPresence', () => {
    it('should add handler to presenceHandlers map', () => {
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      xmppService.subscribeToPresence(roomJid, handler)
      
      const handlers = xmppService.presenceHandlers.get(roomJid)
      
      expect(handlers).toBeDefined()
      expect(handlers).toContain(handler)
    })
    
    it('should set up presence event listener if not already set up', () => {
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      xmppService.subscribeToPresence(roomJid, handler)
      
      expect(mockClient.on).toHaveBeenCalledWith('presence', expect.any(Function))
    })
    
    it('should not set up presence event listener if already set up', () => {
      // Mock listeners to return a non-empty array
      mockClient.listeners.mockReturnValue([() => {}])
      
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      xmppService.subscribeToPresence(roomJid, handler)
      expect(mockClient.on).toHaveBeenCalled()

      // Clear the mock to reset the called flag
      mockClient.on.mockClear()

      const handler2: PresenceHandler = jest.fn()
      const roomJid2 = 'room@conference.example.com'

      xmppService.subscribeToPresence(roomJid2, handler2)
      expect(mockClient.on).not.toHaveBeenCalled()
    })
    
    it('should return function to unsubscribe handler', () => {
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      const unsubscribe = xmppService.subscribeToPresence(roomJid, handler)
      
      // Verify the handler was added
      expect(xmppService.presenceHandlers.get(roomJid)).toContain(handler)
      
      // Add another handler to prevent the room from being removed from the map
      const anotherHandler: PresenceHandler = jest.fn()
      xmppService.subscribeToPresence(roomJid, anotherHandler)
      
      // Unsubscribe the first handler
      unsubscribe()
      
      // Verify the handler was removed but the room still exists in the map
      const handlers = xmppService.presenceHandlers.get(roomJid)
      expect(handlers).toBeDefined()
      expect(handlers).not.toContain(handler)
      expect(handlers).toContain(anotherHandler)
    })
    
    it('should remove room from presenceHandlers map if last handler is unsubscribed', () => {
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      const unsubscribe = xmppService.subscribeToPresence(roomJid, handler)
      
      expect(xmppService.presenceHandlers.has(roomJid)).toBe(true)
      
      unsubscribe()
      
      expect(xmppService.presenceHandlers.has(roomJid)).toBe(false)
    })
  })
  
  describe('handlePresenceUpdate', () => {
    let mockHandler1: jest.Mock
    let mockHandler2: jest.Mock
    
    beforeEach(() => {
      mockHandler1 = jest.fn()
      mockHandler2 = jest.fn()
      
      // Add handlers for two different rooms
      xmppService.presenceHandlers.set('room1@conference.example.com', [mockHandler1])
      xmppService.presenceHandlers.set('room2@conference.example.com', [mockHandler2])
    })
    
    it('should do nothing if presence is null or missing from', () => {
      xmppService.handlePresenceUpdate(null as unknown as ReceivedPresence)
      
      expect(mockHandler1).not.toHaveBeenCalled()
      expect(mockHandler2).not.toHaveBeenCalled()
    })
    
    it('should notify handlers for MUC presence updates', () => {
      const presence = {
        from: 'room1@conference.example.com/user',
        to: 'room1@conference.example.com',
        type: PresenceType.Available
      }
      
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from.split('/')[1], true)
      expect(mockHandler2).not.toHaveBeenCalled()
    })
    
    it('should handle unavailable presence', () => {
      const presence = {
        from: 'room1@conference.example.com/user',
        type: 'unavailable'
      }
      
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from.split('/')[1], false)
    })
    
    it('should notify all handlers for direct presence updates', () => {
      const presence = {
        from: 'user@example.com',
        to: 'user@example.com',
        type: PresenceType.Available
      }
      
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from.split('@')[0], true)
      expect(mockHandler2).toHaveBeenCalledWith(presence.from.split('@')[0], true)
    })
  })
})
