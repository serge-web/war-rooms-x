import { useState, useEffect, useCallback } from 'react'
import { PubSubDocumentChangeHandler, PubSubDocumentResult } from '../services/types'
import { XMPPService } from '../services/XMPPService'

/**
 * Hook for interacting with XMPP PubSub capabilities
 * Provides functionality to subscribe to, get, and update PubSub documents
 */
export const usePubSub = <T extends object>(nodeId: string, xmppClient: XMPPService | null | undefined) => {
  const [document, setDocument] = useState<T | null>(null)
  
  /**
   * Update the PubSub document with new content
   * @param content New content to publish to the PubSub node
   * @returns Promise resolving to PubSubDocumentResult
   */
  const updateDocument = useCallback(async (content: T): Promise<PubSubDocumentResult> => {
    if (!xmppClient?.pubsubService) {
      return { success: false, id: nodeId, error: 'XMPP client or PubSub service not available' }
    }
    
    const res = await xmppClient.updatePubSubDocument(nodeId, content as object)
    return res
  }, [nodeId, xmppClient])
  
  useEffect(() => {
    if (!xmppClient) {
      return
    }
    
    // Handler for PubSub document changes
    const docHandler: PubSubDocumentChangeHandler = (document) => {
      const content = document.content?.json
      if (content && document.id === nodeId) {
        setDocument(content as T)
      }
    }
    
    // Subscribe to the PubSub document and get its current content
    const subAndGet = async () => {
      if (xmppClient.pubsubService) {
        // insert really short delay, to prevent parallel subscriptions
        await new Promise(resolve => setTimeout(resolve, 100))
        const results = await xmppClient.subscribeToPubSubDocument(nodeId, docHandler)
        if (!results.success) {
          if (results.error?.includes('Already subscribed')) {
            console.log('Already subscribed to PubSub document')
          }
        }
      }
      
      const doc = await xmppClient.getPubSubDocument(nodeId)
      if (doc) {
        setDocument(doc.content?.json as T)
      }
    }
    
    subAndGet()
    
    // Cleanup: unsubscribe from the PubSub document when the component unmounts
    return () => {
      if (xmppClient?.pubsubService) {
        xmppClient.unsubscribeFromPubSubDocument(nodeId, docHandler)
          .catch(error => console.error(`Error unsubscribing from PubSub document ${nodeId}:`, error))
      }
    }
  }, [nodeId, xmppClient])
  
  return { document, updateDocument }
}
