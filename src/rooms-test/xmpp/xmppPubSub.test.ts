import { NS_JSON_0 } from 'stanza/Namespaces'
import { JSONItem } from 'stanza/protocol'
import { XMPPService } from '../../rooms-api/xmpp/XMPPService'
import { loadOpenfireConfig } from '../../utils/config'

describe('XMPP PubSub', () => {
  // Module-level constants for testing
  const testNodeId = 'test-node-2'
  const testJsonContent: JSONItem = { 
    itemType: NS_JSON_0, 
    json: { 
      message: 'test content at ' + new Date().toISOString(),
      testId: 'abc-123',
      timestamp: new Date().toISOString()
    } 
  }
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
  })

  it('should create a pub-sub leaf node with open access', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    // check the test node does not exist
    const nodes = await xmppService.listPubSubNodes(pubsubService)
    const nodeExists = nodes.some(node => node.id === testNodeId)

    // if the node exists, delete it
    if (nodeExists) {
      await xmppService.deletePubSubNode(pubsubService, testNodeId)
    }

    // Act - Create a pub-sub leaf node using the module-level test content
    const result = await xmppService.createPubSubDocument(pubsubService, testNodeId, { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, testJsonContent)

    // Assert
    expect(result.success).toBe(true)
    
    // Verify node exists
    const nodes2 = await xmppService.listPubSubNodes(pubsubService)
    const nodeExists2 = nodes2.some(node => node.id === testNodeId)
    expect(nodeExists2).toBe(true)
  })

  it('should retrieve the item from a pub-sub leaf node', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    // Act - Retrieve the item from the pub-sub leaf node
    const result = await xmppService.getPubSubDocument(pubsubService, testNodeId)

    // Assert
    expect(result).not.toBeNull()
    
    // Verify the item content matches what we published
    expect(result?.content).toBeDefined()
    if (result?.content) {
      const content = result.content as JSONItem
      expect(content.itemType).toBe(NS_JSON_0)
      expect(content.json).toEqual(testJsonContent.json)
      expect(content.json.message).toBe(testJsonContent.json.message)
      expect(content.json.testId).toBe(testJsonContent.json.testId)
      expect(content.json.timestamp).toBe(testJsonContent.json.timestamp)
    }
  })

  it('should update a document in a pub-sub node', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // First verify the node exists and has our initial content
    const initialDoc = await xmppService.getPubSubDocument(pubsubService, testNodeId)
    expect(initialDoc).not.toBeNull()
    
    // Create updated content with the same structure but different values
    const updatedJsonContent: JSONItem = { 
      itemType: NS_JSON_0, 
      json: { 
        message: 'updated content at ' + new Date().toISOString(),
        testId: 'updated-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString()
      } 
    }
    
    // Act - Update the document in the node by publishing new content
    // This uses the Stanza publish() method via our wrapper
    const result = await xmppService.publishJsonToPubSubNode(pubsubService, testNodeId, updatedJsonContent)
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.itemId).toBeDefined()
    
    // Verify the document was updated by retrieving it
    const updatedDoc = await xmppService.getPubSubDocument(pubsubService, testNodeId)
    expect(updatedDoc).not.toBeNull()
    
    // Verify the content was updated
    if (updatedDoc?.content) {
      const content = updatedDoc.content as JSONItem
      expect(content.itemType).toBe(NS_JSON_0)
      expect(content.json).toEqual(updatedJsonContent.json)
      expect(content.json.message).toBe(updatedJsonContent.json.message)
      expect(content.json.testId).toBe(updatedJsonContent.json.testId)
      expect(content.json.timestamp).toBe(updatedJsonContent.json.timestamp)
      
      // Verify it's different from the original content
      expect(content.json.message).not.toBe(testJsonContent.json.message)
      expect(content.json.testId).not.toBe(testJsonContent.json.testId)
    }
  })

  // TODO: handle collection nodes
  // it('should create a pub-sub collection node with open access', async () => {
  //   // Arrange
  //   expect(xmppService.isConnected()).toBe(true)

  //   const testNodeId = 'test-node-3'

  //   // check the test node does not exist
  //   const nodes = await xmppService.listPubSubNodes(pubsubService)
  //   const nodeExists = nodes.some(node => node.id === testNodeId)

  //   // if the node exists, delete it
  //   if (nodeExists) {
  //     await xmppService.deletePubSubNode(pubsubService, testNodeId)
  //   }

  //   // Act - Create a pub-sub collection node
  //   const jsonContent = { itemType: NS_JSON_0, json: { message: 'test content 3' } } as JSONItem
  //   const result = await xmppService.createPubSubDocument(pubsubService, testNodeId, { 'pubsub#access_model': 'open', 'pubsub#node_type': 'collection' }, jsonContent)

  //   console.log('publish results 2', result)
    
  //   // Assert
  //   expect(result.success).toBe(true)
    
  //   // Verify node exists
  //   const nodes2 = await xmppService.listPubSubNodes(pubsubService)
  //   const nodeExists2 = nodes2.some(node => node.id === testNodeId)
  //   expect(nodeExists2).toBe(true)

  //   const nodeConfig = await xmppService.getPubSubNodeConfig(pubsubService, testNodeId)
  //   expect(nodeConfig['pubsub#node_type']).toBe('collection')

  //   // add several leaf children to the collection node
  //   for (let i = 0; i < 3; i++) {
  //     const childNodeId = `${testNodeId}-child-${i}`
  //     const jsonContent = { itemType: NS_JSON_0, json: { message: `test content 3 child ${i}` } } as JSONItem
  //     const result = await xmppService.createPubSubChildNode(
  //       pubsubService, 
  //       testNodeId, 
  //       childNodeId, 
  //       { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, 
  //       jsonContent
  //     )
  //     console.log('publish child results', result.error)
  //     expect(result.success).toBe(true)
  //   }

  //   // verify the children exist
  //   const nodes3 = await xmppService.listPubSubNodes(pubsubService)
  //   const nodeExists3 = nodes3.some(node => node.id === testNodeId)
  //   expect(nodeExists3).toBe(true)
    
  //   // Ideally, we would also verify that the children are associated with the parent
  //   // This would require additional API support to list children of a collection
  // })

})
