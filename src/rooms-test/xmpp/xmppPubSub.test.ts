import { XMPPService } from '../../rooms-api/xmpp/XMPPService'
import { loadOpenfireConfig } from '../../utils/config'

describe('XMPP PubSub', () => {
  let xmppService: XMPPService
  let host: string
  let pubsubService: string

  beforeEach(async () => {
    // Set up the XMPP service and connect before each test
    xmppService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    host = openfireConfig.host
    const { username, password } = openfireConfig.credentials[0] // Use the first credential (admin)
    
    // Connect to the XMPP server
    const connected = await xmppService.connect(host, username, password)
    expect(connected).toBe(true)
    
    // Get the pubsub service JID (typically 'pubsub.domain')
    pubsubService = `pubsub.${host}`
  })

  afterEach(async () => {
    // Disconnect after each test
    await xmppService.disconnect()
  })

  it('should verify PubSub support and list all PubSub nodes', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Verify that the server supports PubSub
    const supportsPubSub = await xmppService.supportsPubSub(host)
    expect(supportsPubSub).toBe(true)
    
    // Act - Get PubSub service
    const discoveredPubSubService = await xmppService.getPubSubService(host)
    expect(discoveredPubSubService).not.toBeNull()
    
    if (discoveredPubSubService) {
      // Use the discovered service instead of the assumed one
      pubsubService = discoveredPubSubService
    }
    
    // Act - List PubSub nodes
    const nodes = await xmppService.listPubSubNodes(pubsubService)
    
    // Assert
    expect(Array.isArray(nodes)).toBe(true)
    
    // Log the discovered nodes for debugging
    console.log(`Found ${nodes.length} PubSub nodes on ${pubsubService}`)
    nodes.forEach(node => {
      console.log(`- Node ID: ${node.id}, Name: ${node.name || 'unnamed'}`)
    })
  })
})

it('if no pubsub nodes are present create one', async () => {
