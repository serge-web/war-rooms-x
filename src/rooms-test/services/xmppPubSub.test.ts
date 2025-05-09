import { XMPPService } from '../../services/XMPPService'
import { Agent } from 'stanza'
import { PubSubDocument, PubSubDocumentChangeHandler } from '../../services/types'

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
    createNode: jest.fn(),
    deleteNode: jest.fn(),
    publish: jest.fn(),
    subscribeToNode: jest.fn(),
    unsubscribeFromNode: jest.fn(),
    getItem: jest.fn(),
    getItems: jest.fn(),
    getNodeConfig: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    sendIQ: jest.fn(),
    sendMessage: jest.fn(),
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    jid: 'test-user@test-server/resource'
  }))
  
  return {
    ...originalModule,
    createClient: jest.fn().mockImplementation(() => new MockAgent())
  }
})

describe('XMPPService - PubSub Operations', () => {
  let xmppService: XMPPService
  let mockClient: Agent
  
  beforeEach(() => {
    // Create a new instance of XMPPService for each test
    xmppService = new XMPPService()
    
    // Set up the mock client
    xmppService.client = {
      connect: jest.fn(),
      disconnect: jest.fn().mockResolvedValue(undefined),
      sendPresence: jest.fn(),
      getDiscoInfo: jest.fn(),
      getDiscoItems: jest.fn(),
      createNode: jest.fn(),
      deleteNode: jest.fn(),
      publish: jest.fn(),
      subscribeToNode: jest.fn(),
      unsubscribeFromNode: jest.fn(),
      getItem: jest.fn(),
      getItems: jest.fn(),
      getNodeConfig: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      sendIQ: jest.fn(),
      sendMessage: jest.fn(),
      jid: 'test-user@test-server/resource'
    } as unknown as Agent
    
    mockClient = xmppService.client
    
    // Set connected state and services
    Object.defineProperty(xmppService, 'connected', { value: true, writable: true })
    xmppService.pubsubService = 'pubsub.test-server'
    xmppService.mucService = 'conference.test-server'
    xmppService.bareJid = 'test-user@test-server'
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('PubSub Service Discovery', () => {
    it('should check if server supports PubSub', async () => {
      // Arrange
      mockClient.getDiscoInfo.mockResolvedValue({
        features: ['http://jabber.org/protocol/pubsub']
      })
      
      // Act
      const result = await xmppService.supportsPubSub()
      
      // Assert
      expect(result).toBe(true)
      expect(mockClient.getDiscoInfo).toHaveBeenCalled()
    })
    
    it('should return false if server does not support PubSub', async () => {
      // Arrange
      mockClient.getDiscoInfo.mockResolvedValue({
        features: ['some-other-feature']
      })
      
      // Act
      const result = await xmppService.supportsPubSub()
      
      // Assert
      expect(result).toBe(false)
      expect(mockClient.getDiscoInfo).toHaveBeenCalled()
    })
    
    it('should get PubSub service from server', async () => {
      // Arrange
      mockClient.getDiscoItems.mockResolvedValue({
        items: [
          { jid: 'pubsub.test-server', node: 'pubsub' },
          { jid: 'other.test-server', node: 'other' }
        ]
      })
      
      mockClient.getDiscoInfo.mockImplementation((jid) => {
        if (jid === 'pubsub.test-server') {
          return Promise.resolve({
            features: ['http://jabber.org/protocol/pubsub']
          })
        }
        return Promise.resolve({ features: [] })
      })
      
      // Act
      const result = await xmppService.getPubSubService()
      
      // Assert
      expect(result).toBe('pubsub.test-server')
      expect(mockClient.getDiscoItems).toHaveBeenCalled()
      expect(mockClient.getDiscoInfo).toHaveBeenCalledWith('pubsub.test-server')
    })
  })
  
  describe('PubSub Document Operations', () => {
    it('should create a PubSub collection', async () => {
      // Arrange
      mockClient.createNode.mockResolvedValue({
        pubsub: { create: { node: 'test-collection' } }
      })
      
      // Act
      const result = await xmppService.createPubSubCollection('test-collection')
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.createNode).toHaveBeenCalledWith(
        'pubsub.test-server',
        'test-collection',
        expect.objectContaining({
          type: 'collection'
        })
      )
    })
    
    it('should publish JSON to a PubSub node', async () => {
      // Arrange
      const nodeId = 'test-node'
      const content = { key: 'value' }
      
      mockClient.publish.mockResolvedValue({
        pubsub: { publish: { node: nodeId } }
      })
      
      // Act
      const result = await xmppService.publishJsonToPubSubNode(nodeId, content)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.publish).toHaveBeenCalledWith(
        'pubsub.test-server',
        nodeId,
        expect.objectContaining({
          json: content
        }),
        expect.any(Object)
      )
    })
    
    it('should handle error when publishing to PubSub node', async () => {
      // Arrange
      const nodeId = 'test-node'
      const content = { key: 'value' }
      
      mockClient.publish.mockRejectedValue(new Error('Test error'))
      
      // Act
      const result = await xmppService.publishJsonToPubSubNode(nodeId, content)
      
      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
    })
    
    it('should get a PubSub document', async () => {
      // Arrange
      const nodeId = 'test-node'
      const content = { key: 'value' }
      
      mockClient.getItem.mockResolvedValue({
        pubsub: {
          items: {
            node: nodeId,
            published: [
              { id: 'item-id', content: { json: content } }
            ]
          }
        }
      })
      
      // Act
      const result = await xmppService.getPubSubDocument(nodeId)
      
      // Assert
      expect(result).not.toBeNull()
      expect(result?.id).toBe(nodeId)
      expect(result?.content).toEqual(content)
    })
    
    it('should return null if PubSub document is not found', async () => {
      // Arrange
      const nodeId = 'test-node'
      
      mockClient.getItem.mockResolvedValue({
        pubsub: {
          items: {
            node: nodeId,
            published: []
          }
        }
      })
      
      // Act
      const result = await xmppService.getPubSubDocument(nodeId)
      
      // Assert
      expect(result).toBeNull()
    })
    
    it('should delete a PubSub document', async () => {
      // Arrange
      const nodeId = 'test-node'
      
      mockClient.deleteNode.mockResolvedValue({})
      
      // Act
      const result = await xmppService.deletePubSubDocument(nodeId)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.deleteNode).toHaveBeenCalledWith(
        'pubsub.test-server',
        nodeId
      )
    })
  })
  
  describe('PubSub Subscription Operations', () => {
    it('should subscribe to a PubSub document', async () => {
      // Arrange
      const nodeId = 'test-node'
      const subscriptionId = 'sub-123'
      
      mockClient.subscribeToNode.mockResolvedValue({
        pubsub: {
          subscription: {
            node: nodeId,
            jid: 'test-user@test-server',
            subid: subscriptionId
          }
        }
      })
      
      // Act
      const result = await xmppService.subscribeToPubSubDocument(nodeId)
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.subscriptionId).toBe(subscriptionId)
      expect(mockClient.subscribeToNode).toHaveBeenCalledWith(
        'pubsub.test-server',
        nodeId,
        expect.any(Object)
      )
    })
    
    it('should handle PubSub document change events', async () => {
      // Arrange
      const handler: PubSubDocumentChangeHandler = jest.fn()
      const document: PubSubDocument = {
        id: 'test-node',
        content: { key: 'value' }
      }
      
      // Act
      xmppService.onPubSubDocumentChange(handler)
      
      // Simulate a PubSub event
      const pubsubEventHandler = (xmppService as any).pubsubEventHandler
      pubsubEventHandler({
        pubsub: {
          items: {
            node: document.id,
            published: [
              { content: document.content }
            ]
          }
        }
      })
      
      // Assert
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        id: document.id,
        content: document.content
      }))
    })
    
    it('should unsubscribe from a PubSub document', async () => {
      // Arrange
      const nodeId = 'test-node'
      const subscriptionId = 'sub-123'
      
      // Set up the subscriptionIds map
      (xmppService as any).subscriptionIds.set(nodeId, subscriptionId)
      
      mockClient.unsubscribeFromNode.mockResolvedValue({})
      
      // Act
      const result = await xmppService.unsubscribeFromPubSubDocument(nodeId)
      
      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.unsubscribeFromNode).toHaveBeenCalledWith(
        'pubsub.test-server',
        nodeId,
        expect.objectContaining({
          subid: subscriptionId
        })
      )
    })
  })
})
