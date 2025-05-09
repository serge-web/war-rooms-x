/* eslint-disable @typescript-eslint/no-explicit-any */
import { XMPPService } from '../../services/XMPPService'
import { PresenceHandler } from '../../services/types'

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
  
  describe('getPresence', () => {
    it('should return unavailable if not connected', async () => {
      // Set connected to false
      Object.defineProperty(xmppService, 'connected', {
        value: false,
        writable: true
      })
      
      const result = await xmppService.getPresence('user@example.com')
      
      expect(result).toEqual({ available: false })
      expect(mockClient.sendPresence).not.toHaveBeenCalled()
    })
    
    it('should return unavailable if client is null', async () => {
      // Set client to null
      xmppService.client = null
      
      const result = await xmppService.getPresence('user@example.com')
      
      expect(result).toEqual({ available: false })
    })
    
    it('should send a presence probe to the user', async () => {
      await xmppService.getPresence('user@example.com')
      
      expect(mockClient.sendPresence).toHaveBeenCalledWith({
        to: 'user@example.com',
        type: 'probe'
      })
    })
    
    it('should handle errors when sending presence probe', async () => {
      // Mock sendPresence to throw an error
      mockClient.sendPresence.mockRejectedValue(new Error('Test error'))
      
      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const result = await xmppService.getPresence('user@example.com')
      
      expect(result).toEqual({ available: false })
      expect(consoleSpy).toHaveBeenCalled()
      
      // Restore console.error
      consoleSpy.mockRestore()
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
      
      expect(mockClient.on).not.toHaveBeenCalled()
    })
    
    it('should return function to unsubscribe handler', () => {
      const handler: PresenceHandler = jest.fn()
      const roomJid = 'room@conference.example.com'
      
      const unsubscribe = xmppService.subscribeToPresence(roomJid, handler)
      
      expect(xmppService.presenceHandlers.get(roomJid)).toContain(handler)
      
      unsubscribe()
      
      expect(xmppService.presenceHandlers.get(roomJid)).not.toContain(handler)
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
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate(null)
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate({})
      
      expect(mockHandler1).not.toHaveBeenCalled()
      expect(mockHandler2).not.toHaveBeenCalled()
    })
    
    it('should notify handlers for MUC presence updates', () => {
      const presence = {
        from: 'room1@conference.example.com/user',
        type: undefined // Available
      }
      
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from, true)
      expect(mockHandler2).not.toHaveBeenCalled()
    })
    
    it('should handle unavailable presence', () => {
      const presence = {
        from: 'room1@conference.example.com/user',
        type: 'unavailable'
      }
      
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from, false)
    })
    
    it('should notify all handlers for direct presence updates', () => {
      const presence = {
        from: 'user@example.com',
        type: undefined // Available
      }
      
      // @ts-expect-error - accessing private method for testing
      xmppService.handlePresenceUpdate(presence)
      
      expect(mockHandler1).toHaveBeenCalledWith(presence.from, true)
      expect(mockHandler2).toHaveBeenCalledWith(presence.from, true)
    })
  })
})
