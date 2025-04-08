import { XMPPService } from '../../rooms-api/xmpp/XMPPService'
import { loadOpenfireConfig } from '../../utils/config'

describe('XMPP Discovery', () => {
  let xmppService: XMPPService
  let host: string

  beforeEach(async () => {
    // Arrange
    xmppService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    host = openfireConfig.host
    const { username, password } = openfireConfig.credentials[0] // Use the first credential (admin)
    
    // Connect to XMPP server before each test
    await xmppService.connect(host, username, password)
  })

  afterEach(async () => {
    // Disconnect after each test
    await xmppService.disconnect()
  })

  it('should verify that the server supports MUC and PubSub', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Act
    const supportsMUC = await xmppService.supportsMUC(host)
    const supportsPubSub = await xmppService.supportsPubSub(host)
    
    // Assert
    expect(supportsMUC).toBe(true)
    expect(supportsPubSub).toBe(true)
  })

  it('should retrieve server features through service discovery', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Act
    const features = await xmppService.discoverServerFeatures(host)
    
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
