import { DataForm, DiscoItem, IQ, JSONItem, Message, Pubsub, PubsubEvent, PubsubSubscriptions } from 'stanza/protocol'
import { PubSubDocument, PubSubDocumentChangeHandler, PubSubDocumentResult, PubSubOptions, PubSubSubscribeResult } from '../types'
import { XMPPService } from './index'
import { NS_JSON_0 } from 'stanza/Namespaces'
import { UserConfigType } from '../../types/wargame-d'
import { USERS_COLLECTION, USERS_PREFIX } from '../../types/constants'

const publishedName = 'pubsub:published'
const pubsubEvent = publishedName

/**
 * Service for handling PubSub operations
 */
export class PubSubService {
  private xmppService: XMPPService
  public pubsubServiceUrl: string | null = null
  public pubsubChangeHandlers: PubSubDocumentChangeHandler[] = []
  public subscriptionIds: Map<string, string> = new Map()

  constructor(xmppService: XMPPService) {
    this.xmppService = xmppService
  }

  /**
   * List all PubSub documents (nodes) from the server's PubSub service
   * @returns Promise resolving to array of PubSubDocument objects
   */
  async listPubSubNodes(): Promise<PubSubDocument[]> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return []
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get all nodes from the pubsub service
      const items = await this.xmppService.client.getDiscoItems(this.xmppService.pubsubServiceUrl)
      
      // Convert DiscoItems to PubSubDocument objects
      return items.items
        .filter((item): item is DiscoItem & { node: string } => !!item.node)
        .map((item) => ({
          id: item.node,
          name: item.name || item.node
        }))
    } catch (error) {
      console.error('Error listing PubSub nodes:', error)
      return []
    }
  }

  /**
   * Get items from a PubSub collection
   * @param nodeId The ID of the collection node
   * @returns Promise resolving to array of PubSubDocument objects
   */
  async getPubSubCollectionItems(nodeId: string): Promise<PubSubDocument[]> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return []
    }
    if (!this.xmppService.pubsubServiceUrl) {
      throw new Error('PubSub service not available')
    }
    try {
      const items = await this.xmppService.client.getDiscoItems(this.xmppService.pubsubServiceUrl, nodeId)
      const itemNodes = items.items.map((item) => item.node)
      const getItems = itemNodes.map((node) => this.xmppService.client?.getItems(this.xmppService.pubsubServiceUrl!, node as string))
      const results = await Promise.all(getItems)
      const contents = results.map((result) => result?.items?.[0].content) as JSONItem[]
      const jsonDocs = contents.map((content) => content.json)
      return jsonDocs.filter((result) => result !== null) as PubSubDocument[]
    } catch (error) {
      console.error('Error getting PubSub collection items:', error)
      return []
    }
  }

  /**
   * Create a new PubSub collection node
   * @param nodeId The ID for the new collection node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async createPubSubCollection(nodeId: string): Promise<PubSubDocumentResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      const collectionForm: DataForm = {
        type: 'submit',
        fields: [
          { name: 'FORM_TYPE', type: 'hidden', value: 'http://jabber.org/protocol/pubsub#node_config' },
          { name: 'pubsub#node_type', value: 'collection' },
          { name: 'pubsub#access_model', value: 'open' }
        ]
      }

      const res = await this.xmppService.client.createNode(this.xmppService.pubsubServiceUrl!, nodeId, collectionForm)
      console.log('node creation result', res)

      if (!res) {
        console.error('problem creating collection', nodeId, res)
      }
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error creating PubSub collection ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }  
    }
  }

  /**
   * Publish a new PubSub leaf node, creating it if necessary
   * @param nodeId The ID for the new node
   * @param collection Optional collection to add this leaf to
   * @param content Optional initial content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async publishPubSubLeaf(nodeId: string, collection: string | undefined, content?: object): Promise<PubSubDocumentResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }

      // check if the leaf exists
      if (!await this.checkPubSubNodeExists(nodeId)) {
        console.log('node not present, creating', nodeId)
        // create the document
        const leafForm: DataForm = {
          type: 'submit',
          fields: [
          { name: 'FORM_TYPE', type: 'hidden', value: 'http://jabber.org/protocol/pubsub#node_config' },
          { name: 'pubsub#node_type', value: 'leaf' },
          { name: 'pubsub#access_model', value: 'open' },
          { name: 'pubsub#persist_items', value: 'true' },
          ]
        }

        if (collection) {
          // check if the collection exists
          if (!await this.checkPubSubNodeExists(collection)) {
            // create the collection
            const res = await this.createPubSubCollection(collection)
            if (!res || !res.id) {
              console.error('problem creating collection', collection, res)
            }
          }

          leafForm.fields?.push({ name: 'pubsub#collection', value: collection })
        }

        const res = await this.xmppService.client.createNode(this.xmppService.pubsubServiceUrl!, nodeId, leafForm)
        if (!res || !res.node) {
          console.error('problem creating leaf document', res)
        }
      }
  
      // now store item, if present
      if (content) {
        const jsonDoc: JSONItem = {
          itemType: NS_JSON_0,
          json: content
        }
        const pushResults = await this.xmppService.client.publish(this.xmppService.pubsubServiceUrl!, nodeId, jsonDoc)
        if (!pushResults || !pushResults.id) {
          console.error('problem publishing leaf content', nodeId, pushResults)
        }
      }

      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error creating PubSub leaf ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }  
    }
  }

  /**
   * Update a JSON document in a PubSub node. Note: the publisher for a message does not receive subscription notifications, so
   * that notifications are manually triggered for local subscribers.
   * @param nodeId The ID of the node to update
   * @param content The new JSON content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async publishJsonToPubSubNode(nodeId: string, content: object): Promise<PubSubDocumentResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      const wrappedItem: JSONItem = {
        itemType: NS_JSON_0,
        json: content
      }
      
      // Publish the JSON content to the node
      const result = await this.xmppService.client.publish(this.xmppService.pubsubServiceUrl!, nodeId, wrappedItem)
      
      // Manually trigger the document change event for local subscribers
      // This ensures that our local handlers are notified even if the XMPP server
      // doesn't send a notification back to the publisher
      const jsonContent: JSONItem = {
        itemType: NS_JSON_0,
        json: content
      }
      const document: PubSubDocument = {
        id: nodeId,
        content: jsonContent
      }
      
      // Notify all registered handlers about the document change
      this.pubsubChangeHandlers.forEach(handler => handler(document))
      
      return { success: true, id: nodeId, itemId: result.id }
    } catch (error) {
      console.error(`Error publishing JSON to PubSub node ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Delete a PubSub document (node)
   * @param nodeId The ID of the node to delete
   * @returns Promise resolving to PubSubDocumentResult
   */
  async deletePubSubDocument(nodeId: string): Promise<PubSubDocumentResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Delete the node
      await this.xmppService.client.deleteNode(this.xmppService.pubsubServiceUrl!, nodeId)
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error deleting PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Subscribe to a PubSub document (node) and register a change handler
   * @param nodeId The ID of the node to subscribe to
   * @param handler Optional handler function to call when the document changes
   * @returns Promise resolving to PubSubSubscribeResult
   */
  async subscribeToPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubSubscribeResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // check we aren't already subscribed to this node
      const subIdForThisNode = this.subscriptionIds.get(nodeId)
      if (subIdForThisNode) {
        return { success: true, id: nodeId, subscriptionId: subIdForThisNode }
      } else {
        // check if we're already subscribed to this node
        const subscriptions = await this.xmppService.client.getSubscriptions(this.xmppService.pubsubServiceUrl!)
        if (subscriptions) {
          const mySubs = subscriptions.items?.filter((item) => {
            return (item.node === nodeId) && (item.jid === this.xmppService.bareJid)
          })
          // map to unsubscribe promises
          const unsubscribePromises = mySubs?.map((subscription) => {
            return this.xmppService.client?.unsubscribeFromNode(this.xmppService.pubsubServiceUrl!, {
              node: nodeId,
              subid: subscription.subid
            })
          })
          // await all unsubscribe promises
          if (unsubscribePromises) {
            try {
              await Promise.all(unsubscribePromises)
            } catch (error) {
              console.warn(`Error unsubscribing from PubSub document ${nodeId}:`, error)
            }
          }
        }

        // Subscribe to the node
        const result = await this.xmppService.client.subscribeToNode(this.xmppService.pubsubServiceUrl!, nodeId)
        
        // Store the subscription ID for later use when unsubscribing
        if (result && result.subid) {
          this.subscriptionIds.set(nodeId, result.subid)
          // Register the handler if provided
          if (handler) {
            this.pubsubChangeHandlers.push(handler)
          }
          return { success: true, id: nodeId, subscriptionId: result?.subid }
        } else {
          return { success: false, id: nodeId, error: 'Failed to subscribe:' }
        }
      }
    } catch (error) {
      console.error(`Error subscribing to PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Unsubscribe from a PubSub document (node)
   * @param nodeId The ID of the node to unsubscribe from
   * @param handler Optional handler function to remove
   * @returns Promise resolving to PubSubDocumentResult
   */
  async unsubscribeFromPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler, subscriptionId?: string): Promise<PubSubDocumentResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }
    
    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get the subscription ID if available
      const subid = this.subscriptionIds.get(nodeId)

      // Unsubscribe from the node with the subscription ID if available
      if (subid) {
        await this.xmppService.client.unsubscribeFromNode(this.xmppService.pubsubServiceUrl!, {
          node: nodeId,
          subid
        })
        
        // Remove the subscription ID from the map
        this.subscriptionIds.delete(nodeId)
      } else {
        // Try without subscription ID, but this might fail
        if (subscriptionId) {
          await this.xmppService.client.unsubscribeFromNode(this.xmppService.pubsubServiceUrl!, {
            node: nodeId,
            subid: subscriptionId
          })
        } else {
          await this.xmppService.client.unsubscribeFromNode(this.xmppService.pubsubServiceUrl!, nodeId)
        }
      }
      
      // Remove the handler if provided
      if (handler) {
        const index = this.pubsubChangeHandlers.indexOf(handler)
        if (index !== -1) {
          this.pubsubChangeHandlers.splice(index, 1)
        }
      }
      
      return { success: true, id: nodeId }
    } catch (error) {
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get the subscriptions for current user
   */
  async clearPubSubSubscriptions(): Promise<PubsubSubscriptions | null> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return null
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get the items from the node
      const result = await this.xmppService.client.getSubscriptions(this.xmppService.pubsubServiceUrl)
      
      // delete all subscriptions
      if (result && result.items) {
        for (const item of result.items) {
          const subOpts = {
            node: item.node,
            subid: item.subid
          }
          await this.xmppService.client.unsubscribeFromNode(this.xmppService.pubsubServiceUrl, subOpts)
        }
      }

      return result
    } catch (error: unknown) {
      console.error(`Error getting PubSub subscriptions:`, error)
      return null  
    }
  }

  /**
   * Get the content of a PubSub document (node)
   * @param nodeId The ID of the node to get content from
   * @returns Promise resolving to PubSubDocument or null if not found
   */
  async getPubSubDocument(nodeId: string): Promise<PubSubDocument | null> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return null
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get the items from the node
      const existingSub = this.subscriptionIds.get(nodeId)

      // do we already have a subscription?
      if (existingSub) {
        // we need to use a special stanza, which provides the subscription id.
        const iq = {
          type: 'get',
          to: this.xmppService.pubsubServiceUrl,
          pubsub: {
            items: {
                node: nodeId,
                subscription: existingSub
            }
          }
        } as IQ
        const items = await this.xmppService.client.sendIQ(iq)
        if (items?.pubsub?.fetch?.items && items.pubsub.fetch.items.length > 0) {
          const item = items.pubsub.fetch.items[0] as PubSubDocument
          return item
        }
        return null
      }
      else {
        const result = await this.xmppService.client.getItems(this.xmppService.pubsubServiceUrl!, nodeId)

        if (result.items && result.items.length > 0) {
          const item = result.items[0] as PubSubDocument
          const jsonItem = item.content as JSONItem
          return jsonItem.json
        }
        
        return null
      }
    } catch (error) {
      // check for item not found
      const sError = error as { error: { condition: string } }
      if (sError && sError.error?.condition === 'item-not-found') {
        const psError = (sError as unknown as { pubsub: Pubsub }).pubsub as Pubsub
        console.error('Failed to find pubsub node:' + psError.fetch?.node)
      }
      console.log('get docs error:', sError)
      if(sError && sError.error?.condition === 'item-not-found') {
        return null
      } else {
        console.error(`Error getting PubSub document ${nodeId}:`, error)
        return null  
      }
    }
  }

  /**
   * Set up the event handler for PubSub events
   */
  setupPubSubEventHandler(): void {
    if (!this.xmppService.client) return
    
    // Check if this handler is already registered
    const existingListeners = this.xmppService.client.listeners(pubsubEvent)
  
    // Only add the listener if it's not already present
    if (!existingListeners.some(listener => listener.toString() === this.pubsubEventHandler.toString())) {
      this.xmppService.client.on(pubsubEvent, this.pubsubEventHandler)
    }
  }

  /**
   * Register a handler for PubSub document changes
   * @param handler The handler function to call when a document changes
   */
  onPubSubDocumentChange(handler: PubSubDocumentChangeHandler): void {
    this.pubsubChangeHandlers.push(handler)
  }

  /**
   * Remove a PubSub document change handler
   * @param handler The handler function to remove
   */
  offPubSubDocumentChange(handler: PubSubDocumentChangeHandler): void {
    const index = this.pubsubChangeHandlers.indexOf(handler)
    if (index !== -1) {
      this.pubsubChangeHandlers.splice(index, 1)
    }
  }

  /**
   * Check if the pubsub node exists
   * @param nodeId The ID of the node 
   * @returns Promise resolving to boolean
   */
  async checkPubSubNodeExists(nodeId: string): Promise<boolean> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      throw new Error('Not connected')
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get the node configuration using StanzaJS
      const result = await this.xmppService.client.getNodeConfig(this.xmppService.pubsubServiceUrl!, nodeId)
      return result !== null
    } catch (error) {
        // check for item not found
        const sError = error as { error: { condition: string } }
        if(sError && sError.error?.condition === 'item-not-found') {
          return false
        } else {
          console.error(`Error checking PubSub node exists ${nodeId}:`, error)
          throw error
        }        
    }
  }
      
  /**
   * Get the configuration of a PubSub node
   * @param nodeId The ID of the node to get configuration for
   * @returns Promise resolving to PubSubOptions containing the node configuration
   */
  async getPubSubNodeConfig(nodeId: string): Promise<PubSubOptions> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      throw new Error('Not connected')
    }

    try {
      if (!this.xmppService.pubsubServiceUrl) {
        throw new Error('PubSub service not available')
      }
      
      // Get the node configuration using StanzaJS
      const result = await this.xmppService.client.getNodeConfig(this.xmppService.pubsubServiceUrl!, nodeId)
      
      // Extract the node type from the configuration form
      let nodeType: 'leaf' | 'collection' = 'leaf' // Default to leaf
      let access: 'open' | 'authorise' = 'open' // Default to open
      
      // Look for the node_type field in the form
      if (result && result.fields) {
        for (const field of result.fields) {
          if (field.name === 'pubsub#node_type' && field.value) {
            nodeType = field.value === 'collection' ? 'collection' : 'leaf'
          }
          if (field.name === 'pubsub#access_model' && field.value) {
            access = field.value === 'authorize' ? 'authorise' : 'open'
          }
        }
      }
      
      return {
        'pubsub#node_type': nodeType,
        'pubsub#access_model': access
      }
    } catch (error) {
      console.error(`Error getting PubSub node config for ${nodeId}:`, error)
      throw error
    }
  }

  /**
   * Update user force ID in PubSub
   * @param bareJid The bare JID of the user
   * @param forceId The force ID to set for the user
   */
  async updateUserForceId(bareJid: string, forceId: string | undefined): Promise<void> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      throw new Error('Not connected')
    }
    const userDocName = USERS_PREFIX + bareJid
    // do we have pubsub document with this jid?
    const doc = await this.getPubSubDocument(userDocName)
    if (!doc) {
      // generate doc
      const userDoc: Partial<UserConfigType> = {
        name: bareJid
      }
      if (forceId) {
        userDoc.forceId = forceId
      }
      const jsonDoc: JSONItem = {
        itemType: NS_JSON_0,
        json: userDoc
      }
      // do we have users collection?
      const users = await this.checkPubSubNodeExists(USERS_COLLECTION)
      if (!users) {
        const res = await this.createPubSubCollection(USERS_COLLECTION)
        if (!res || !res.id) {
          console.error('problem creating users collection', res)
        }
      }
      await this.publishPubSubLeaf(userDocName, USERS_COLLECTION, jsonDoc)
    } else {
      const userDoc = doc as UserConfigType
      userDoc.forceId = forceId
      await this.publishJsonToPubSubNode(userDocName, userDoc)
    }
  }

  // Define the pubsub event handler function
  private pubsubEventHandler = (message: Message) => {
    if (!message.pubsub) return
    const pubsub = message.pubsub as PubsubEvent
    
    if (!pubsub.items || !pubsub.items.published || pubsub.items.published.length === 0) return
    
    const nodeId = pubsub.items?.node || ''
    const item = pubsub.items.published[0] as PubSubDocument
    
    const document: PubSubDocument = {
      id: nodeId,
      content: item.content
    }
    
    // Notify all registered handlers
    this.pubsubChangeHandlers.forEach(handler => {
      handler(document)
    })
  }
}
