import { XMPPService } from '../../rooms-api/xmpp/XMPPService'
import { loadOpenfireConfig } from '../../utils/config'
import { RoomMessage } from '../../rooms-api/xmpp/types'

describe('XMPP MUC (Multi-User Chat)', () => {
  let xmppService: XMPPService
  let host: string
  let receivedMessages: RoomMessage[] = []
  let messageHandler: (message: RoomMessage) => void

  beforeEach(async () => {
    // Arrange
    xmppService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    host = openfireConfig.host
    const { username, password } = openfireConfig.credentials
    
    // Connect to XMPP server before each test
    await xmppService.connect(host, username, password)
    
    // Clear received messages before each test
    receivedMessages = []
    
    // Initialize message handler for future tests
    messageHandler = (message: RoomMessage) => {
      receivedMessages.push(message)
    }
    
    // Register the message handler
    xmppService.onRoomMessage(messageHandler)
  })

  afterEach(async () => {
    // Make sure we clean up properly
    try {
      // Disconnect from the XMPP server
      await xmppService.disconnect()
      
      // Clear the message handler
      if (messageHandler) {
        xmppService.offRoomMessage(messageHandler)
      }
      
      // Clear received messages
      receivedMessages = []
      
      console.log('Cleanup complete')
    } catch (err) {
      console.error('Error during cleanup:', err)
    }
  })

  it('should list available rooms for the user', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Act
    const rooms = await xmppService.listRooms()
    
    // Assert
    expect(rooms).not.toBeNull()
    expect(Array.isArray(rooms)).toBe(true)
    
    // Log rooms for debugging
    console.log(`Found ${rooms.length} rooms:`, rooms)
    
    // Rooms should have the expected properties
    if (rooms.length > 0) {
      const room = rooms[0]
      expect(room).toHaveProperty('jid')
      expect(room).toHaveProperty('name')
    }
  })

  // it('should join a room and receive existing messages', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)
    
  //   // Act
  //   const joinResult = await xmppService.joinRoom(testRoomJid)
    
  //   // Assert
  //   expect(joinResult.success).toBe(true)
  //   expect(joinResult.roomJid).toBe(testRoomJid)
    
  //   // Check if we can get room history
  //   const history = await xmppService.getRoomHistory(testRoomJid)
  //   expect(Array.isArray(history)).toBe(true)
    
  //   // Verify we're in the room
  //   const joinedRooms = await xmppService.getJoinedRooms()
  //   expect(joinedRooms).toContain(testRoomJid)
  // })

  // it('should send a message to a room', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)
  //   await xmppService.joinRoom(testRoomJid)
    
  //   // Act
  //   const testMessage = `Test message ${new Date().toISOString()}`
  //   const sendResult = await xmppService.sendRoomMessage(testRoomJid, testMessage)
    
  //   // Assert
  //   expect(sendResult.success).toBe(true)
  //   expect(sendResult.id).toBeTruthy()
  // })

  // it('should receive a message from a room', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)
  //   await xmppService.joinRoom(testRoomJid)
    
  //   // Act
  //   const testMessage = `Test message ${new Date().toISOString()}`
  //   await xmppService.sendRoomMessage(testRoomJid, testMessage)
    
  //   // Wait for the message to be received (may be our own message echoed back)
  //   await new Promise(resolve => setTimeout(resolve, 1000))
    
  //   // Assert
  //   expect(receivedMessages.length).toBeGreaterThan(0)
    
  //   // Find our test message
  //   const foundMessage = receivedMessages.find(msg => msg.body === testMessage)
  //   expect(foundMessage).toBeTruthy()
  //   if (foundMessage) {
  //     expect(foundMessage.roomJid).toBe(testRoomJid)
  //   }
  // })

  // it('should leave a room', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)
  //   await xmppService.joinRoom(testRoomJid)
    
  //   // Verify we're in the room first
  //   let joinedRooms = await xmppService.getJoinedRooms()
  //   expect(joinedRooms).toContain(testRoomJid)
    
  //   // Act
  //   const leaveResult = await xmppService.leaveRoom(testRoomJid)
    
  //   // Assert
  //   expect(leaveResult.success).toBe(true)
    
  //   // Verify we're no longer in the room
  //   joinedRooms = await xmppService.getJoinedRooms()
  //   expect(joinedRooms).not.toContain(testRoomJid)
  // })
})
