import { NS_JSON_0 } from 'stanza/Namespaces'
import { JSONItem } from 'stanza/protocol'
import { XMPPService } from '../../services/XMPPService.js'
import { PubSubDocument } from '../../services/types.js'
import { loadOpenfireConfig } from '../../utils/config.js'

// Import fail from Jest
const { fail } = global as { fail: (message: string) => never }

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

  beforeEach(async () => {
    // Set up the XMPP service and connect before each test
    xmppService = new XMPPService()
    const openfireConfig = loadOpenfireConfig()
    host = openfireConfig.host
    const { username, password } = openfireConfig.credentials[0] // Use the first credential (admin)
    
    // Connect to the XMPP server
    const connected = await xmppService.connect(host, username, password)
    expect(connected).toBe(true)
    
    // The pubsubService will be automatically discovered and stored in XMPPService
  })

  afterEach(async () => {
    // Disconnect after each test
    await xmppService.disconnect()
  })

  it('should verify PubSub support and list all PubSub nodes', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // Verify that the server supports PubSub
    const supportsPubSub = await xmppService.supportsPubSub()
    expect(supportsPubSub).toBe(true)
    
    // Act - Get PubSub service
    const discoveredPubSubService = await xmppService.getPubSubService()
    expect(discoveredPubSubService).not.toBeNull()
    
    // The discovered service will be automatically stored in XMPPService.pubsubService
    
    // Act - List PubSub nodes
    const nodes = await xmppService.listPubSubNodes()
    
    // Assert
    expect(Array.isArray(nodes)).toBe(true)    
  })

  it('should create a pub-sub leaf node with open access', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    // check the test node does not exist
    const nodes = await xmppService.listPubSubNodes()
    const nodeExists = nodes.some(node => node.id === testNodeId)

    // if the node exists, delete it
    if (nodeExists) {
      await xmppService.deletePubSubNode(testNodeId)
    }

    // Act - Create a pub-sub leaf node using the module-level test content
    const result = await xmppService.createPubSubDocument(testNodeId, { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, testJsonContent)

    // Assert
    expect(result.success).toBe(true)
    
    // Verify node exists
    const nodes2 = await xmppService.listPubSubNodes()
    const nodeExists2 = nodes2.some(node => node.id === testNodeId)
    expect(nodeExists2).toBe(true)
  })

  it('should retrieve the item from a pub-sub leaf node', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    // Act - Retrieve the item from the pub-sub leaf node
    const result = await xmppService.getPubSubDocument(testNodeId)

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
    const initialDoc = await xmppService.getPubSubDocument(testNodeId)
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
    const result = await xmppService.publishJsonToPubSubNode(testNodeId, updatedJsonContent)
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.itemId).toBeDefined()
    
    // Verify the document was updated by retrieving it
    const updatedDoc = await xmppService.getPubSubDocument(testNodeId)
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

  it('should delete a pub-sub document', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)
    
    // First verify the node exists
    const nodes = await xmppService.listPubSubNodes()
    const nodeExists = nodes.some(node => node.id === testNodeId)
    expect(nodeExists).toBe(true)
    
    // Act - Delete the node
    const result = await xmppService.deletePubSubNode(testNodeId)
    
    // Assert
    expect(result.success).toBe(true)
    
    // Verify node no longer exists
    const nodesAfterDelete = await xmppService.listPubSubNodes()
    const nodeExistsAfterDelete = nodesAfterDelete.some(node => node.id === testNodeId)
    expect(nodeExistsAfterDelete).toBe(false)
  })

  // Test for subscribing to document changes
  it('should subscribe to document changes and receive updates when the document changes', async () => {
    // Arrange
    expect(xmppService.isConnected()).toBe(true)

    // Create a test node for subscription testing
    const testSubscriptionNodeId = 'test-subscription-node'
    
    // Check if the test node exists and delete it if it does
    const nodes = await xmppService.listPubSubNodes()
    const nodeExists = nodes.some(node => node.id === testSubscriptionNodeId)
    
    if (nodeExists) {
      await xmppService.deletePubSubNode(testSubscriptionNodeId)
    }
    
    // Create the test node with initial content
    const initialContent: JSONItem = { 
      itemType: NS_JSON_0, 
      json: { 
        message: 'initial content',
        testId: 'subscription-test',
        timestamp: new Date().toISOString()
      } 
    }
    
    const createResult = await xmppService.createPubSubDocument(
      testSubscriptionNodeId, 
      { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, 
      initialContent
    )
    
    expect(createResult.success).toBe(true)
    
    // Set up a promise to track document changes
    let documentChangeResolver: (document: PubSubDocument) => void
    
    const documentChangePromise = new Promise<PubSubDocument>((resolve) => {
      documentChangeResolver = resolve
    })
    
    // Register a handler for document changes
    const documentChangeHandler = (document: PubSubDocument) => {
      // Only resolve for our test node
      if (document.id === testSubscriptionNodeId) {
        documentChangeResolver(document)
      }
    }
    
    // Act - Subscribe to the node
    const subscribeResult = await xmppService.subscribeToPubSubDocument(testSubscriptionNodeId)
    expect(subscribeResult.success).toBe(true)

    // Subscribe to document changes
    xmppService.onPubSubDocumentChange(documentChangeHandler)
    
    // Update the document content
    const updatedContent: JSONItem = { 
      itemType: NS_JSON_0, 
      json: { 
        message: 'updated content for subscription test',
        testId: 'subscription-test-updated',
        timestamp: new Date().toISOString()
      } 
    }
    
    // Publish the updated content
    const updateResult = await xmppService.publishJsonToPubSubNode(testSubscriptionNodeId, updatedContent)
    expect(updateResult.success).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Wait for the document change notification with a timeout
    let timeoutId: NodeJS.Timeout | undefined = undefined
    const timeoutPromise = new Promise<PubSubDocument>((_, reject) => {
      timeoutId = setTimeout(() => {
        console.log('Timeout reached waiting for document change notification')
        reject(new Error('Timeout waiting for document change notification'))
      }, 4000) // Shorter than Jest's 5000ms default
    })
    
    try {
      // Assert - Wait for the document change notification or timeout
      const changedDocument = await Promise.race([documentChangePromise, timeoutPromise])
      
      // Verify the document content was updated
      expect(changedDocument).not.toBeNull()
      expect(changedDocument.content).toBeDefined()
      
      if (changedDocument.content) {
        const content = changedDocument.content as JSONItem
        expect(content.itemType).toBe(NS_JSON_0)
        expect(content.json.message).toBe(updatedContent.json.message)
        expect(content.json.testId).toBe(updatedContent.json.testId)
      }
    } catch (error) {
      // If we get here, the notification was not received, so the test should fail
      // First verify that the document was actually updated
      const updatedDoc = await xmppService.getPubSubDocument(testSubscriptionNodeId)
      
      if (updatedDoc?.content) {
        const content = updatedDoc.content as JSONItem
        if (content.itemType === NS_JSON_0 && 
            content.json.message === updatedContent.json.message && 
            content.json.testId === updatedContent.json.testId) {
          // Document was updated but notification wasn't received - fail the test
          fail('Document was updated correctly, but the subscription notification was not received')
        } else {
          fail('Document was not updated correctly: ' + JSON.stringify(content))
        }
      } else {
        fail('Document was not updated and no notification was received: ' + error)
      }
    } finally {
      // Clear the timeout to prevent hanging
      clearTimeout(timeoutId)
      
      // Clean up - Unsubscribe from document changes
      xmppService.offPubSubDocumentChange(documentChangeHandler)
      
      try {
        // Try to unsubscribe, but don't fail the test if this fails
        await xmppService.unsubscribeFromPubSubDocument(testSubscriptionNodeId)
      } catch (e) {
        console.log('Error unsubscribing, continuing cleanup:', e)
      }
      
      try {
        // Try to delete the node, but don't fail the test if this fails
        await xmppService.deletePubSubNode(testSubscriptionNodeId)
      } catch (e) {
        console.log('Error deleting node, continuing:', e)
      }
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
