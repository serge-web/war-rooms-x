import { NS_JSON_0 } from 'stanza/Namespaces'
import { JSONItem } from 'stanza/protocol'
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

  it('should create a pub-sub leaf node with open access', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    const testNodeId = 'test-node-2'

    // check the test node does not exist
    const nodes = await xmppService.listPubSubNodes(pubsubService)
    const nodeExists = nodes.some(node => node.id === testNodeId)

    // if the node exists, delete it
    if (nodeExists) {
      await xmppService.deletePubSubNode(pubsubService, testNodeId)
    }

    // Act - Create a pub-sub leaf node
    const jsonContent = { itemType: NS_JSON_0, json: { message: 'test content' } } as JSONItem
    const result = await xmppService.createPubSubDocument(pubsubService, testNodeId, { access: 'open', nodeType: 'leaf' }, jsonContent)

    console.log('publish results', result.error)
    
    // Assert
    expect(result.success).toBe(true)
    
    // Verify node exists
    const nodes2 = await xmppService.listPubSubNodes(pubsubService)
    const nodeExists2 = nodes2.some(node => node.id === testNodeId)
    expect(nodeExists2).toBe(true)
  })


  // it('should create PubSub nodes using document names in openfire.json', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)
    
  //   // Get initial node count
  //   const initialNodes = await xmppService.listPubSubNodes(pubsubService)
  //   const initialNodeCount = initialNodes.length

  //   if (initialNodeCount > 0) {
  //     return
  //   }
    
  //   // Load document configs
  //   const openfireConfig = loadOpenfireConfig()
  //   const documents = Object.keys(openfireConfig.documents)
    
  //   // Act - Create nodes for each document
  //   const creationResults = []
  //   for (const doc of documents) {
  //     const config = openfireConfig.documents[doc]
  //     // Use the existing createPubSubDocument method instead of non-existent createPubSubNode
  //     const result = await xmppService.createPubSubDocument(pubsubService, config.id, { access: config.access, nodeType: config.nodeType}, config.content)
  //     creationResults.push(result)
  //   }
    
  //   // Get updated node list
  //   const updatedNodes = await xmppService.listPubSubNodes(pubsubService)
    
  //   // Assert
  //   // Verify that all creation operations were successful
  //   creationResults.forEach(result => {
  //     expect(result.success).toBe(true)
  //   })
    
  //   // Verify that nodes were created (at least the ones that didn't exist before)
  //   expect(updatedNodes.length).toBeGreaterThanOrEqual(initialNodeCount)
    
  //   // Verify that all document nodes exist in the updated list
  //   for (const doc of documents) {
  //     const config = openfireConfig.documents[doc]
  //     const nodeExists = updatedNodes.some(node => node.id === config.id)
  //     expect(nodeExists).toBe(true)
  //   }
  // }) 
})
