import { XMPPService, ALL_ROOMS } from '../../services/XMPPService'
import { Agent } from 'stanza'
import { GameMessage } from '../../types/rooms-d'
import { RoomMessageHandler } from '../../services/types'

// Mock the stanza library
jest.mock('stanza', () => {
  const originalModule = jest.requireActual('stanza')
  
  // Create a mock Agent class
  const MockAgent = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(undefined),
    sendPresence: jest.fn(),
    getDiscoInfo: jest.fn(),
    getDiscoItems: jest.fn(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    sendMessage: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    jid: 'test-user@test-server/resource'
  }))
  
  return {
    ...originalModule,
    createClient: jest.fn().mockImplementation(() => new MockAgent())
  }
})

describe('XMPPService - MUC Operations', () => {
  let xmppService: XMPPService
  let mockClient: Agent & {
    connect: jest.Mock
    disconnect: jest.Mock
    sendPresence: jest.Mock
    getDiscoInfo: jest.Mock
    getDiscoItems: jest.Mock
    joinRoom: jest.Mock
    leaveRoom: jest.Mock
    sendMessage: jest.Mock
    on: jest.Mock
    off: jest.Mock
    jid: string
  }
  
  beforeEach(() => {
    // Create a new instance of XMPPService for each test
    xmppService = new XMPPService()
    
    // Create a mock client
    const client = {
      connect: jest.fn(),
      disconnect: jest.fn().mockResolvedValue(undefined),
      sendPresence: jest.fn(),
      getDiscoInfo: jest.fn(),
      getDiscoItems: jest.fn(),
      joinRoom: jest.fn().mockResolvedValue({}),
      leaveRoom: jest.fn().mockResolvedValue({}),
      sendMessage: jest.fn().mockResolvedValue({}),
      on: jest.fn(),
      off: jest.fn(),
      jid: 'test-user@test-server/resource'
    }
    
    // Set the client and cast it to the Agent type
    xmppService.client = client as unknown as Agent
    
    // Set the mockClient with the proper type
    mockClient = client as unknown as Agent & {
      connect: jest.Mock
      disconnect: jest.Mock
      sendPresence: jest.Mock
      getDiscoInfo: jest.Mock
      getDiscoItems: jest.Mock
      joinRoom: jest.Mock
      leaveRoom: jest.Mock
      sendMessage: jest.Mock
      on: jest.Mock
      off: jest.Mock
      jid: string
    }
    
    // Set connected state and services
    Object.defineProperty(xmppService, 'connected', { value: true, writable: true })
    xmppService.pubsubService = 'pubsub.test-server'
    xmppService.mucService = 'conference.test-server'
    xmppService.bareJid = 'test-user@test-server'
    
    // Set up message handler
    xmppService.setupRoomMessageHandler()
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('MUC Service Discovery', () => {
    it('should check if server supports MUC', async () => {
      // Arrange
      mockClient.getDiscoInfo.mockResolvedValue({
        features: ['http://jabber.org/protocol/muc']
      })
      
      // Act
      const result = await xmppService.supportsMUC()
      
      // Assert
      expect(result).toBe(true)
      expect(mockClient.getDiscoInfo).toHaveBeenCalled()
    })
    
    it('should return false if server does not support MUC', async () => {
      // Arrange
      mockClient.getDiscoInfo.mockResolvedValue({
        features: ['some-other-feature']
      })
      
      // Act
      const result = await xmppService.supportsMUC()
      
      // Assert
      expect(result).toBe(false)
      expect(mockClient.getDiscoInfo).toHaveBeenCalled()
    })
    
    it('should get MUC service from server', async () => {
      // Arrange
      mockClient.getDiscoItems.mockResolvedValue({
        items: [
          { jid: 'conference.test-server', node: 'muc' },
          { jid: 'other.test-server', node: 'other' }
        ]
      })
      
      mockClient.getDiscoInfo.mockImplementation((jid: string) => {
        if (jid === 'conference.test-server') {
          return Promise.resolve({
            features: ['http://jabber.org/protocol/muc']
          })
        }
        return Promise.resolve({ features: [] })
      })
      
      // Act
      const result = await xmppService.getMUCService()
      
      // Assert
      expect(result).toBe('conference.test-server')
      expect(mockClient.getDiscoItems).toHaveBeenCalled()
      expect(mockClient.getDiscoInfo).toHaveBeenCalledWith('conference.test-server')
    })
    
    it('should list available rooms', async () => {
      // Arrange
      mockClient.getDiscoItems.mockResolvedValue({
        items: [
          { jid: 'room1@conference.test-server', name: 'Room 1' },
          { jid: 'room2@conference.test-server', name: 'Room 2' }
        ]
      })
      
      // Act
      const result = await xmppService.listRooms()
      
      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].jid).toBe('room1@conference.test-server')
      expect(result[0].name).toBe('Room 1')
      expect(result[1].jid).toBe('room2@conference.test-server')
      expect(result[1].name).toBe('Room 2')
      expect(mockClient.getDiscoItems).toHaveBeenCalledWith('conference.test-server')
    })
  })
  
  describe('Room Operations', () => {
    it('should join a room', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      const messageHandler: RoomMessageHandler = jest.fn()
      
      // Act
      const result = await xmppService.joinRoom(roomJid, messageHandler)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.joinRoom).toHaveBeenCalledWith(
        roomJid,
        'test-user',
        expect.any(Object)
      )
      
      // Verify the room was added to joinedRooms
      expect((xmppService as unknown as { joinedRooms: Set<string> }).joinedRooms.has(roomJid)).toBe(true)
      
      // Verify the message handler was registered
      const handlers = (xmppService as unknown as { messageHandlers: Map<string, RoomMessageHandler[]> }).messageHandlers.get(roomJid)
      expect(handlers).toBeDefined()
      expect(handlers).toContain(messageHandler)
    })
    
    it('should handle error when joining a room', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      mockClient.joinRoom.mockRejectedValue(new Error('Test error'))
      
      // Act
      const result = await xmppService.joinRoom(roomJid)
      
      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
      
      // Verify the room was not added to joinedRooms
      expect((xmppService as unknown as { joinedRooms: Set<string> }).joinedRooms.has(roomJid)).toBe(false)
    })
    
    it('should leave a room', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      const messageHandler: RoomMessageHandler = jest.fn()
      
      // First join the room
      await xmppService.joinRoom(roomJid, messageHandler)
      
      // Act
      const result = await xmppService.leaveRoom(roomJid, messageHandler)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.leaveRoom).toHaveBeenCalledWith(roomJid)
      
      // Verify the room was removed from joinedRooms
      expect((xmppService as unknown as { joinedRooms: Set<string> }).joinedRooms.has(roomJid)).toBe(false)
      
      // Verify the message handler was removed
      const handlers = (xmppService as unknown as { messageHandlers: Map<string, RoomMessageHandler[]> }).messageHandlers.get(roomJid)
      expect(handlers).toBeDefined()
      expect(handlers).not.toContain(messageHandler)
    })
    
    it('should get room members', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      
      // First join the room
      await xmppService.joinRoom(roomJid)
      
      // Mock the disco items response
      mockClient.getDiscoItems.mockResolvedValue({
        items: [
          { jid: 'room@conference.test-server/user1', name: 'User 1' },
          { jid: 'room@conference.test-server/user2', name: 'User 2' }
        ]
      })
      
      // Act
      const result = await xmppService.getRoomMembers(roomJid)
      
      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].jid).toBe('room@conference.test-server/user1')
      expect(result[0].name).toBe('User 1')
      expect(result[1].jid).toBe('room@conference.test-server/user2')
      expect(result[1].name).toBe('User 2')
    })
    
    it('should return empty array when getting members of a room that is not joined', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      
      // Act
      const result = await xmppService.getRoomMembers(roomJid)
      
      // Assert
      expect(result).toEqual([])
      expect(mockClient.getDiscoItems).not.toHaveBeenCalled()
    })
  })
  
  describe('Message Operations', () => {
    it('should send a message to a room', async () => {
      // Arrange
      const message: GameMessage = {
        id: 'msg-123',
        details: {
          messageType: 'chat',
          senderId: 'test-user',
          senderName: 'Test User',
          senderForce: 'force1',
          turn: '1',
          phase: 'planning',
          timestamp: '2023-01-01T00:00:00.000Z',
          channel: 'room@conference.test-server'
        },
        content: { text: 'Hello, world!' }
      }
      
      // Act
      const result = await xmppService.sendRoomMessage(message)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.sendMessage).toHaveBeenCalledWith({
        to: 'room@conference.test-server',
        type: 'groupchat',
        body: expect.any(String)
      })
    })
    
    it('should handle error when sending a message', async () => {
      // Arrange
      const message: GameMessage = {
        id: 'msg-123',
        details: {
          messageType: 'chat',
          senderId: 'test-user',
          senderName: 'Test User',
          senderForce: 'force1',
          turn: '1',
          phase: 'planning',
          timestamp: '2023-01-01T00:00:00.000Z',
          channel: 'room@conference.test-server'
        },
        content: { text: 'Hello, world!' }
      }
      
      mockClient.sendMessage.mockRejectedValue(new Error('Test error'))
      
      // Act
      const result = await xmppService.sendRoomMessage(message)
      
      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
    })
    
    it('should register and notify message handlers', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      const messageHandler1: RoomMessageHandler = jest.fn()
      const messageHandler2: RoomMessageHandler = jest.fn()
      const allRoomsHandler: RoomMessageHandler = jest.fn()
      
      // Register handlers
      xmppService.onRoomMessage(messageHandler1, roomJid)
      xmppService.onRoomMessage(messageHandler2, roomJid)
      xmppService.onRoomMessage(allRoomsHandler, ALL_ROOMS)
      
      // Create a mock message
      const mockMessage = {
        from: roomJid + '/user1',
        type: 'groupchat',
        body: JSON.stringify({
          id: 'msg-123',
          details: {
            messageType: 'chat',
            senderId: 'user1',
            senderName: 'User 1',
            senderForce: 'force1',
            turn: '1',
            phase: 'planning',
            timestamp: '2023-01-01T00:00:00.000Z',
            channel: roomJid
          },
          content: { text: 'Hello, world!' }
        })
      }
      
      // Get the message handler that was registered with the client
      const clientMessageHandler = mockClient.on.mock.calls.find(
        (call: [string, string]) => call[0] === 'groupchat'
      )[1]
      
      // Act - simulate receiving a message
      clientMessageHandler(mockMessage)
      
      // Assert
      expect(messageHandler1).toHaveBeenCalledWith(mockMessage)
      expect(messageHandler2).toHaveBeenCalledWith(mockMessage)
      expect(allRoomsHandler).toHaveBeenCalledWith(mockMessage)
    })
    
    it('should remove a specific message handler', async () => {
      // Arrange
      const roomJid = 'room@conference.test-server'
      const messageHandler1: RoomMessageHandler = jest.fn()
      const messageHandler2: RoomMessageHandler = jest.fn()
      
      // Register handlers
      xmppService.onRoomMessage(messageHandler1, roomJid)
      xmppService.onRoomMessage(messageHandler2, roomJid)
      
      // Remove one handler
      xmppService.offRoomMessage(messageHandler1, roomJid)
      
      // Create a mock message
      const mockMessage = {
        from: roomJid + '/user1',
        type: 'groupchat',
        body: JSON.stringify({
          id: 'msg-123',
          details: {
            messageType: 'chat',
            senderId: 'user1',
            senderName: 'User 1',
            senderForce: 'force1',
            turn: '1',
            phase: 'planning',
            timestamp: '2023-01-01T00:00:00.000Z',
            channel: roomJid
          },
          content: { text: 'Hello, world!' }
        })
      }
      
      // Get the message handler that was registered with the client
      const clientMessageHandler = mockClient.on.mock.calls.find(
        (call: [string, string]) => call[0] === 'groupchat'
      )[1]
      
      // Act - simulate receiving a message
      clientMessageHandler(mockMessage)
      
      // Assert
      expect(messageHandler1).not.toHaveBeenCalled()
      expect(messageHandler2).toHaveBeenCalledWith(mockMessage)
    })
  })
})
