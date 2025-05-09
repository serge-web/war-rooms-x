import { XMPPService } from '../../services/XMPPService.js'
import { loadOpenfireConfig } from '../../utils/config.js'
import { isServerReachable } from '../../utils/network.js'

describe('XMPP Discovery', () => {
  let xmppService: XMPPService
  let host: string
  let serverAvailable = false

  beforeEach(async () => {
    // Arrange
    xmppService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    host = openfireConfig.host
    const { username, password } = openfireConfig.credentials[0] // Use the first credential (admin)
    
    // Check if server is available
    const port = 5222 // Default XMPP port
    serverAvailable = await isServerReachable(openfireConfig.ip, port)
    
    if (!serverAvailable) {
      console.log(`XMPP server at ${openfireConfig.ip}:${port} is not reachable, skipping test`)
      return
    }
    
    // Connect to XMPP server before each test
    await xmppService.connect(openfireConfig.ip, host, username, password)
  })

  afterEach(async () => {
    // Only disconnect if we were connected
    if (serverAvailable) {
      await xmppService.disconnect()
    }
  })

  it('should verify that the server supports MUC and PubSub', async () => {
    // Skip test if server is not available
    if (!serverAvailable) {
      return
    }

    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Act
    const supportsMUC = await xmppService.supportsMUC()
    const supportsPubSub = await xmppService.supportsPubSub()
    
    // Assert
    expect(supportsMUC).toBe(true)
    expect(supportsPubSub).toBe(true)
  })

  it('should retrieve server features through service discovery', async () => {
    // Skip test if server is not available
    if (!serverAvailable) {
      return
    }

    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Act
    const features = await xmppService.discoverServerFeatures()
    
    // Assert
    expect(features).not.toBeNull()
    expect(features?.features).toBeInstanceOf(Array)
    expect(features?.identities).toBeInstanceOf(Array)
    
    // Log all discovered features for debugging
    // console.log('Discovered server features:', features?.features)
    
    // Check if any PubSub-related features are available
    const hasPubSubFeatures = features?.features.some(f => f.includes('pubsub')) || false
    expect(hasPubSubFeatures).toBe(true)
  })
})
