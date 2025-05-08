import { renderHook, waitFor } from '@testing-library/react'
import { usePubSub } from '../../hooks/usePubSub'
import { PubSubDocument, PubSubDocumentChangeHandler, PubSubDocumentResult, PubSubSubscribeResult } from '../../services/types'
import { XMPPService } from '../../services/XMPPService'
import { act } from 'react-dom/test-utils'
import { Agent } from 'stanza'
import { NS_JSON_0 } from 'stanza/Namespaces'

// Mock XMPPService methods
const mockPublishJsonToPubSubNode = jest.fn()
const mockSubscribeToPubSubDocument = jest.fn()
const mockGetPubSubDocument = jest.fn()
const mockUnsubscribeFromPubSubDocument = jest.fn()

// Create a mock XMPPService class that extends the real one
class MockXMPPService extends XMPPService {
  constructor(pubsubServiceAvailable = true) {
    super()
    this.pubsubService = pubsubServiceAvailable ? 'pubsub.example.com' : null
    // Create a minimal mock of the Stanza Agent
    this.client = { } as Agent
  }

  // Override the methods we need for testing
  async publishJsonToPubSubNode(nodeId: string, content: object): Promise<PubSubDocumentResult> {
    return mockPublishJsonToPubSubNode(nodeId, content)
  }

  async subscribeToPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubSubscribeResult> {
    return mockSubscribeToPubSubDocument(nodeId, handler)
  }

  async getPubSubDocument(nodeId: string): Promise<PubSubDocument | null> {
    return mockGetPubSubDocument(nodeId)
  }

  async unsubscribeFromPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubDocumentResult> {
    return mockUnsubscribeFromPubSubDocument(nodeId, handler)
  }
}

describe('usePubSub hook', () => {
  const nodeId = 'test-node'
  const testDocument = { id: 'test-doc', name: 'Test Document', data: { value: 42 } }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockSubscribeToPubSubDocument.mockResolvedValue({ 
      success: true, 
      id: nodeId, 
      subscriptionId: 'test-subscription-id' 
    })
    
    mockGetPubSubDocument.mockResolvedValue({
      id: nodeId,
      content: {
        json: testDocument
      }
    })
    
    mockPublishJsonToPubSubNode.mockResolvedValue({
      success: true,
      id: nodeId,
      itemId: 'test-item-id'
    })
    
    mockUnsubscribeFromPubSubDocument.mockResolvedValue({
      success: true,
      id: nodeId
    })
  })

  it('should return null document when xmppClient is null', async () => {
    // Render the hook with null xmppClient
    const { result } = renderHook(() => usePubSub(nodeId, null))
    
    // Verify document is null
    expect(result.current.document).toBeNull()
    
    // Verify no XMPP service methods were called
    expect(mockSubscribeToPubSubDocument).not.toHaveBeenCalled()
    expect(mockGetPubSubDocument).not.toHaveBeenCalled()
  })

  it('should handle document updates when xmppClient is available', async () => {
    // Create mock XMPP service
    const mockXMPPService = new MockXMPPService()
    
    // Render the hook with mock XMPP service
    const { result } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(mockSubscribeToPubSubDocument).toHaveBeenCalledWith(
        nodeId, 
        expect.any(Function)
      )
    })
    
    // Verify document is set from getPubSubDocument
    await waitFor(() => {
      expect(result.current.document).toEqual(testDocument)
    })
    
    // Verify getPubSubDocument was called
    expect(mockGetPubSubDocument).toHaveBeenCalledWith(nodeId)
  })

  it('should handle document updates through updateDocument', async () => {
    // Create mock XMPP service
    const mockXMPPService = new MockXMPPService()
    
    // Render the hook with mock XMPP service
    const { result } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Wait for initial setup
    await waitFor(() => {
      expect(result.current.document).toEqual(testDocument)
    })
    
    // Update document
    const updatedDocument = { ...testDocument, name: 'Updated Document' }
    let updateResult: PubSubDocumentResult | undefined
    
    await act(async () => {
      updateResult = await result.current.updateDocument(updatedDocument)
    })
    
    // Verify publishJsonToPubSubNode was called with correct arguments
    expect(mockPublishJsonToPubSubNode).toHaveBeenCalledWith(nodeId, updatedDocument)
    
    // Verify update result
    expect(updateResult).toEqual({
      success: true,
      id: nodeId,
      itemId: 'test-item-id'
    })
  })

  it('should handle errors when updating document', async () => {
    // Create mock XMPP service
    const mockXMPPService = new MockXMPPService()
    
    // Mock error response for publishJsonToPubSubNode
    mockPublishJsonToPubSubNode.mockResolvedValueOnce({
      success: false,
      id: nodeId,
      error: 'Failed to publish document'
    })
    
    // Render the hook with mock XMPP service
    const { result } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Wait for initial setup
    await waitFor(() => {
      expect(result.current.document).toEqual(testDocument)
    })
    
    // Update document
    const updatedDocument = { ...testDocument, name: 'Updated Document' }
    let updateResult: PubSubDocumentResult | undefined
    
    await act(async () => {
      updateResult = await result.current.updateDocument(updatedDocument)
    })
    
    // Verify error result
    expect(updateResult).toEqual({
      success: false,
      id: nodeId,
      error: 'Failed to publish document'
    })
  })

  it('should handle updateDocument when pubsubService is not available', async () => {
    // Create mock XMPP service without pubsubService
    const mockXMPPService = new MockXMPPService(false)
    
    // Render the hook with mock XMPP service
    const { result } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Update document
    const updatedDocument = { ...testDocument, name: 'Updated Document' }
    let updateResult: PubSubDocumentResult | undefined
    
    await act(async () => {
      updateResult = await result.current.updateDocument(updatedDocument)
    })
    
    // Verify publishJsonToPubSubNode was not called
    expect(mockPublishJsonToPubSubNode).not.toHaveBeenCalled()
    
    // Verify error result
    expect(updateResult).toEqual({
      success: false,
      id: nodeId,
      error: 'XMPP client or PubSub service not available'
    })
  })

  it('should handle document changes through subscription handler', async () => {
    // Create mock XMPP service
    const mockXMPPService = new MockXMPPService()
    
    // Capture the document change handler
    let capturedHandler: PubSubDocumentChangeHandler | undefined
    mockSubscribeToPubSubDocument.mockImplementationOnce((nodeId, handler) => {
      capturedHandler = handler
      return Promise.resolve({ success: true, id: nodeId, subscriptionId: 'test-subscription-id' })
    })
    
    // Render the hook with mock XMPP service
    const { result } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Wait for initial setup
    await waitFor(() => {
      expect(mockSubscribeToPubSubDocument).toHaveBeenCalled()
    })
    
    // Simulate document change event
    const updatedDocument = { ...testDocument, name: 'Changed Document' }
    act(() => {
      if (capturedHandler) {
        capturedHandler({
          id: nodeId,
          content: {
            json: updatedDocument,
            itemType: NS_JSON_0
          }
        })
      }
    })
    
    // Verify document state is updated
    expect(result.current.document).toEqual(updatedDocument)
  })

  it('should unsubscribe when unmounting', async () => {
    // Create mock XMPP service
    const mockXMPPService = new MockXMPPService()
    
    // Render the hook with mock XMPP service
    const { unmount } = renderHook(() => usePubSub(nodeId, mockXMPPService))
    
    // Wait for initial setup
    await waitFor(() => {
      expect(mockSubscribeToPubSubDocument).toHaveBeenCalled()
    })
    
    // Capture the handler that was passed to subscribeToPubSubDocument
    const handler = mockSubscribeToPubSubDocument.mock.calls[0][1]
    
    // Unmount the component
    unmount()
    
    // Verify unsubscribeFromPubSubDocument was called with correct arguments
    expect(mockUnsubscribeFromPubSubDocument).toHaveBeenCalledWith(nodeId, handler)
  })
})
