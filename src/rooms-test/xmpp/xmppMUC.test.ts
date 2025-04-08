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
    const { username, password } = openfireConfig.credentials[0]
    
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
  
  it('should verify that no-perms user cannot access any rooms', async () => {
    // Arrange - Create a new service instance for the no-perms user
    const noPermsService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    
    // Get the no-perms credentials
    const noPermsCredentials = openfireConfig.credentials.find((cred: { username: string, password: string }) => cred.username === 'no-perms')
    expect(noPermsCredentials).toBeDefined()
    
    if (noPermsCredentials) {
      // Connect with no-perms user
      const connected = await noPermsService.connect(
        host, 
        noPermsCredentials.username, 
        noPermsCredentials.password
      )
      
      // Assert connection was successful
      expect(connected).toBe(true)
      expect(noPermsService.isConnected()).toBe(true)
      
      // Act - Try to list rooms
      const rooms = await noPermsService.listRooms()

      // Assert - User should not have access to any rooms
      expect(rooms).toHaveLength(0)
      
      // Clean up
      await noPermsService.disconnect()
    }
  })

  it('should allow admin user to join a room and receive existing messages', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    const openfireConfig = loadOpenfireConfig()
    const roomJid = `${openfireConfig.rooms['red-chat']}@conference.${host}`
    
    // Act
    const joinResult = await xmppService.joinRoom(roomJid)
    
    // Assert
    expect(joinResult.success).toBe(true)
    expect(joinResult.roomJid).toBe(roomJid)
    
    // Check if we can get room history
    const history = await xmppService.getRoomHistory(roomJid)
    expect(Array.isArray(history)).toBe(true)
    console.log('history 1', history)
    
    // Verify we're in the room
    const joinedRooms = await xmppService.getJoinedRooms()
    expect(joinedRooms).toContain(roomJid)
  })

  it('should prevent no-perms user from joining a room', async () => {
    // Arrange - Create a new service instance for the no-perms user
    const noPermsService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    const roomJid = `${openfireConfig.rooms['red-chat']}@conference.${host}`
    
    // Get the no-perms credentials
    const noPermsCredentials = openfireConfig.credentials.find((cred: { username: string, password: string }) => cred.username === 'no-perms')
    expect(noPermsCredentials).toBeDefined()
    
    if (noPermsCredentials) {
      // Connect with no-perms user
      const connected = await noPermsService.connect(
        host, 
        noPermsCredentials.username, 
        noPermsCredentials.password
      )
      
      // Assert connection was successful
      expect(connected).toBe(true)
      expect(noPermsService.isConnected()).toBe(true)
      
      // Act - Try to join the room
      const joinResult = await noPermsService.joinRoom(roomJid, true)

      // Assert - User should not be able to join the room
      expect(joinResult.success).toBe(false)
      
      // Verify we're not in the room
      const joinedRooms = await noPermsService.getJoinedRooms()
      expect(joinedRooms).not.toContain(roomJid)
      
      // Clean up
      await noPermsService.disconnect()
    }
  })

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
