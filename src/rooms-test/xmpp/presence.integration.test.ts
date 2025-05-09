import { XMPPService } from '../../services/XMPPService'
import { PresenceHandler } from '../../services/types'

/**
 * Integration tests for the presence functionality in XMPPService
 * 
 * These tests verify that the presence functionality works correctly
 * with a real XMPP server. They require a running OpenFire server.
 * 
 * To run these tests, you need to have an OpenFire server running
 * and configured with the test users.
 */
describe('XMPPService Presence Integration', () => {
  // Test configuration
  const config = {
    host: process.env.XMPP_HOST || 'localhost',
    user1: {
      jid: process.env.XMPP_USER1_JID || 'user1@localhost',
      password: process.env.XMPP_USER1_PASSWORD || 'password'
    },
    user2: {
      jid: process.env.XMPP_USER2_JID || 'user2@localhost',
      password: process.env.XMPP_USER2_PASSWORD || 'password'
    },
    room: process.env.XMPP_ROOM_JID || 'testroom@conference.localhost',
    ip: process.env.XMPP_IP || 'localhost'
  }
  
  // Skip tests if integration tests are disabled
  const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'
  
  // XMPPService instances for the two test users
  let user1Service: XMPPService
  let user2Service: XMPPService
  
  // Set up the test environment
  beforeAll(async () => {
    // Skip setup if integration tests are disabled
    if (!runIntegrationTests) return
    
    // Create XMPPService instances for both users
    user1Service = new XMPPService()
    user2Service = new XMPPService()
    
    // Connect the first user
    await user1Service.connect(
      config.ip,
      config.host,
      config.user1.jid.split('@')[0],
      config.user1.password
    )
    
    // Connect the second user
    await user2Service.connect(
      config.ip,
      config.host,
      config.user2.jid.split('@')[0],
      config.user2.password
    )
    
    // Join the test room with both users
    await user1Service.joinRoom(config.room, (message) => {
      console.log('User1 received message:', message)
    })
    await user2Service.joinRoom(config.room, (message) => {
      console.log('User2 received message:', message)
    })
  }, 10000) // Increase timeout for connection setup
  
  // Clean up after tests
  afterAll(async () => {
    // Skip cleanup if integration tests are disabled
    if (!runIntegrationTests) return
    
    // Leave the test room with both users
    await user1Service.leaveRoom(config.room)
    await user2Service.leaveRoom(config.room)
    
    // Disconnect both users
    user1Service.disconnect()
    user2Service.disconnect()
  })
  
  // Test that getPresence returns the correct presence status
  it('should get presence status for a user', async () => {
    // Skip test if integration tests are disabled
    if (!runIntegrationTests) {
      console.log('Skipping integration test: should get presence status for a user')
      return
    }
    
    // Get presence for user2 from user1's perspective
    const presence = await user1Service.getPresence(config.user2.jid)
    
    // User2 should be available since they're connected
    expect(presence).toBeDefined()
    expect(presence.available).toBe(true)
  }, 5000)
  
  // Test that subscribeToPresence correctly notifies about presence changes
  it('should notify about presence changes', async () => {
    // Skip test if integration tests are disabled
    if (!runIntegrationTests) {
      console.log('Skipping integration test: should notify about presence changes')
      return
    }
    
    // Create a mock handler for presence updates
    const presenceHandler = jest.fn() as jest.MockedFunction<PresenceHandler>
    
    // Subscribe to presence updates for the room
    const unsubscribe = user1Service.subscribeToPresence(config.room, presenceHandler)
    
    // Simulate user2 going offline and online again
    await user2Service.disconnect()
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reconnect user2
    await user2Service.connect(
      config.ip,
      config.host,
      config.user2.jid.split('@')[0],
      config.user2.password
    )
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Join the room again
    await user2Service.joinRoom(config.room, (message) => {
      console.log('User2 reconnected received message:', message)
    })
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unsubscribe from presence updates
    unsubscribe()
    
    // Verify that the handler was called at least twice
    // Once for the unavailable presence and once for the available presence
    expect(presenceHandler).toHaveBeenCalledTimes(2)
    
    // The first call should be for unavailable presence
    expect(presenceHandler.mock.calls[0][1]).toBe(false)
    
    // The second call should be for available presence
    expect(presenceHandler.mock.calls[1][1]).toBe(true)
  }, 10000)
  
  // Test that multiple handlers for the same room all receive updates
  it('should notify multiple handlers for the same room', async () => {
    // Skip test if integration tests are disabled
    if (!runIntegrationTests) {
      console.log('Skipping integration test: should notify multiple handlers for the same room')
      return
    }
    
    // Create two mock handlers for presence updates
    const handler1 = jest.fn() as jest.MockedFunction<PresenceHandler>
    const handler2 = jest.fn() as jest.MockedFunction<PresenceHandler>
    
    // Subscribe both handlers to presence updates for the room
    const unsubscribe1 = user1Service.subscribeToPresence(config.room, handler1)
    const unsubscribe2 = user1Service.subscribeToPresence(config.room, handler2)
    
    // Simulate user2 going offline and online again
    await user2Service.disconnect()
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reconnect user2
    await user2Service.connect(
      config.ip,
      config.host,
      config.user2.jid.split('@')[0],
      config.user2.password
    )
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Join the room again
    await user2Service.joinRoom(config.room, (message) => {
      console.log('User2 reconnected received message:', message)
    })
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unsubscribe both handlers
    unsubscribe1()
    unsubscribe2()
    
    // Verify that both handlers were called
    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
    
    // Both handlers should have been called the same number of times
    expect(handler1.mock.calls.length).toBe(handler2.mock.calls.length)
  }, 10000)
  
  // Test that unsubscribing a handler stops it from receiving updates
  it('should stop notifying after unsubscribe', async () => {
    // Skip test if integration tests are disabled
    if (!runIntegrationTests) {
      console.log('Skipping integration test: should stop notifying after unsubscribe')
      return
    }
    
    // Create a mock handler for presence updates
    const handler = jest.fn() as jest.MockedFunction<PresenceHandler>
    
    // Subscribe to presence updates for the room
    const unsubscribe = user1Service.subscribeToPresence(config.room, handler)
    
    // Simulate user2 going offline
    await user2Service.disconnect()
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unsubscribe from presence updates
    unsubscribe()
    
    // Reset the mock to clear previous calls
    handler.mockClear()
    
    // Reconnect user2
    await user2Service.connect(
      config.ip,
      config.host,
      config.user2.jid.split('@')[0],
      config.user2.password
    )
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Join the room again
    await user2Service.joinRoom(config.room, (message) => {
      console.log('User2 reconnected received message:', message)
    })
    
    // Wait for presence update to propagate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verify that the handler was not called after unsubscribing
    expect(handler).not.toHaveBeenCalled()
  }, 10000)
})
