import * as XMPP from 'stanza'
import { Agent } from 'stanza'
import { DiscoInfoResult, DiscoItem, JSONItem, Message, PubsubEvent } from 'stanza/protocol'
import { JoinRoomResult, LeaveRoomResult, PubSubDocument, PubSubDocumentChangeHandler, PubSubDocumentResult, PubSubOptions, PubSubSubscribeResult, Room, RoomMessage, RoomMessageHandler, SendMessageResult } from './types'

/**
 * Service for handling XMPP connections and communications
 */
export class XMPPService {
  private client: Agent | null = null
  private connected = false
  private jid = ''
  private joinedRooms: Set<string> = new Set()
  private messageHandlers: RoomMessageHandler[] = []
  private pubsubChangeHandlers: PubSubDocumentChangeHandler[] = []
  private subscriptionIds: Map<string, string> = new Map() // Map of nodeId to subscriptionId

  /**
   * Connect to the XMPP server
   * @param host The XMPP server host
   * @param username The username for authentication
   * @param password The password for authentication
   * @returns Promise resolving to true if connection was successful
   */
  async connect(host: string, username: string, password: string): Promise<boolean> {
    try {
      this.client = XMPP.createClient({
        jid: `${username}@${host}`,
        password,
        transports: {
          websocket: `ws://${host}:7070/ws/`
        }
      })

      return new Promise<boolean>((resolve) => {
        if (!this.client) {
          resolve(false)
          return
        }

        this.client.on('session:started', () => {
          this.connected = true
          this.jid = this.client?.jid || ''
          
          // Set up PubSub event handler when connection is established
          this.setupPubSubEventHandler()
          
          resolve(true)
        })

        this.client.on('disconnected', () => {
          this.connected = false
        })

        this.client.on('auth:failed', () => {
          this.connected = false
          resolve(false)
        })

        this.client.connect()
      })
    } catch (error) {
      console.error('Error connecting to XMPP server:', error)
      return false
    }
  }

  /**
   * Disconnect from the XMPP server
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      this.client.disconnect()
      this.connected = false
    }
  }

  /**
   * Check if the client is connected to the XMPP server
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * Get the JID (Jabber ID) of the connected client
   * @returns The JID string or empty string if not connected
   */
  getJID(): string {
    return this.jid
  }

  /**
   * Discover server features and capabilities
   * @param server The server JID to query
   * @returns Promise resolving to discovery info data
   */
  async discoverServerFeatures(server: string): Promise<DiscoInfoResult | null> {
    if (!this.client || !this.connected) {
      return null
    }

    try {
      return await this.client.getDiscoInfo(server)
    } catch (error) {
      console.error('Error discovering server features:', error)
      return null
    }
  }

  /**
   * Check if the server supports a specific feature
   * @param server The server JID to query
   * @param feature The feature namespace to check for
   * @returns Promise resolving to boolean indicating if feature is supported
   */
  async serverSupportsFeature(server: string, feature: string): Promise<boolean> {
    const info = await this.discoverServerFeatures(server)
    if (!info) return false
    
    return info.features.some(f => f.startsWith(feature))
  }

  /**
   * Check if the server supports MUC (Multi-User Chat)
   * @param server The server JID to query
   * @returns Promise resolving to boolean indicating if MUC is supported
   */
  async supportsMUC(server: string): Promise<boolean> {
    // First try direct feature detection
    const directSupport = await this.serverSupportsFeature(server, 'http://jabber.org/protocol/muc')
    if (directSupport) return true
    
    // If not found directly, check for MUC service
    try {
      if (this.client) {
        const items = await this.client.getDiscoItems(server)
        // Look for conference/muc service in items
        for (const item of items.items) {
          if (item.jid && (item.jid.includes('conference') || item.jid.includes('muc'))) {
            return true
          }
        }
      }
    } catch (error) {
      console.error('Error checking for MUC service:', error)
    }
    
    return false
  }

  /**
   * Check if the server supports PubSub
   * @param server The server JID to query
   * @returns Promise resolving to boolean indicating if PubSub is supported
   */
  async supportsPubSub(server: string): Promise<boolean> {
    // Check for any pubsub-related feature
    const info = await this.discoverServerFeatures(server)
    if (!info) return false
    
    return info.features.some(feature => feature.includes('pubsub'))
  }

  /**
   * Get the MUC (conference) service JID for the server
   * @param server The server domain
   * @returns Promise resolving to the MUC service JID or null if not found
   */
  async getMUCService(server: string): Promise<string | null> {
    if (!this.client || !this.connected) {
      return null
    }

    try {
      const items = await this.client.getDiscoItems(server)
      
      // Look for conference/muc service in items
      for (const item of items.items) {
        if (item.jid && (item.jid.includes('conference') || item.jid.includes('muc'))) {
          return item.jid
        }
      }
      
      // If not found in items, try the standard conference subdomain
      return `conference.${server}`
    } catch (error) {
      console.error('Error discovering MUC service:', error)
      return null
    }
  }

  /**
   * List available rooms on the server
   * @returns Promise resolving to array of Room objects
   */
  async listRooms(): Promise<Room[]> {
    if (!this.client || !this.connected) {
      return []
    }

    try {
      const server = this.jid.split('@')[1]
      const mucService = await this.getMUCService(server)
      
      if (!mucService) {
        console.error('Could not find MUC service')
        return []
      }
      
      const items = await this.client.getDiscoItems(mucService)
      
      // Convert DiscoItems to Room objects
      return items.items
        .filter((item): item is DiscoItem & { jid: string } => !!item.jid)
        .map((item) => ({
          jid: item.jid,
          name: item.name || item.jid.split('@')[0]
        }))
    } catch (error) {
      console.error('Error listing rooms:', error)
      return []
    }
  }

  /**
   * Join a MUC room
   * @param roomJid The JID of the room to join
   * @param nickname Optional nickname to use in the room (defaults to local part of user JID)
   * @returns Promise resolving to JoinRoomResult
   */
  async joinRoom(roomJid: string, suppressErrors: boolean = false): Promise<JoinRoomResult> {
    if (!this.client || !this.connected) {
      return { success: false, roomJid, error: 'Not connected' }
    }

    try {
      // If nickname not provided, use the local part of the JID
      const nick = this.jid.split('@')[0]
      
      // Set up message handler for this room if not already done
      this.setupRoomMessageHandler()
      
      // Join the room
      await this.client.joinRoom(roomJid, nick)
      
      // Add to our joined rooms set
      this.joinedRooms.add(roomJid)
      
      return { success: true, roomJid }
    } catch (error) {
      if (!suppressErrors) {
        console.error(`Error joining room ${roomJid}:`, error)
      }
      return { success: false, roomJid, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Leave a MUC room
   * @param roomJid The JID of the room to leave
   * @returns Promise resolving to LeaveRoomResult
   */
  async leaveRoom(roomJid: string): Promise<LeaveRoomResult> {
    if (!this.client || !this.connected) {
      return { success: false, roomJid, error: 'Not connected' }
    }

    try {
      // Extract the nickname from our JID
      const nickname = this.jid.split('@')[0]
      
      // Leave the room - StanzaJS leaveRoom returns void, not a Promise
      // We need to wrap it in a Promise to ensure all operations complete
      await new Promise<void>((resolve) => {
        this.client!.leaveRoom(roomJid, nickname, {})
        // Add a small delay to ensure the XMPP operation completes
        setTimeout(resolve, 100)
      })
      
      // Remove from our joined rooms set
      this.joinedRooms.delete(roomJid)
      
      return { success: true, roomJid }
    } catch (error) {
      console.error(`Error leaving room ${roomJid}:`, error)
      return { success: false, roomJid, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get a list of rooms the user has joined
   * @returns Array of room JIDs
   */
  async getJoinedRooms(): Promise<string[]> {
    return Array.from(this.joinedRooms)
  }

  /**
   * Send a message to a MUC room
   * @param roomJid The JID of the room to send the message to
   * @param body The message body
   * @returns Promise resolving to SendMessageResult
   */
  async sendRoomMessage(roomJid: string, body: string): Promise<SendMessageResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: '', error: 'Not connected' }
    }

    try {
      // Check if we've joined this room
      if (!this.joinedRooms.has(roomJid)) {
        return { success: false, id: '', error: 'Not joined to this room' }
      }
      
      // Generate a unique ID for the message
      const id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      
      // Send the message
      await this.client.sendMessage({
        to: roomJid,
        type: 'groupchat',
        body,
        id
      })
      
      return { success: true, id }
    } catch (error) {
      console.error(`Error sending message to room ${roomJid}:`, error)
      return { success: false, id: '', error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get message history for a room
   * @param roomJid The JID of the room
   * @param limit Optional maximum number of messages to retrieve
   * @returns Promise resolving to array of RoomMessage objects
   */
  async getRoomHistory(roomJid: string): Promise<RoomMessage[]> {
    if (!this.client || !this.connected) {
      return []
    }

    try {
      // Check if we've joined this room
      if (!this.joinedRooms.has(roomJid)) {
        console.error(`Cannot get history for room ${roomJid}: not joined`)
        return []
      }
      
      // For this initial implementation, we'll use a simplified approach
      // In a real implementation, you would use MAM (Message Archive Management)
      // or another appropriate XEP to retrieve message history
      
      // Return an empty array for now - this would be replaced with actual
      // history retrieval in a production implementation
      return []
    } catch (error) {
      console.error(`Error getting history for room ${roomJid}:`, error)
      return []
    }
  }

  /**
   * Set up the message handler for MUC room messages
   */
  private setupRoomMessageHandler(): void {
    if (!this.client) return
    
    // Only set up the handler once
    if (this.client.listeners('groupchat').length > 0) return
    
    this.client.on('groupchat', (message) => {
      // Skip messages without a body
      if (!message.body) return
      
      const roomMessage: RoomMessage = {
        id: message.id || `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        roomJid: message.from.split('/')[0], // Remove the resource part
        from: message.from,
        body: message.body,
        timestamp: new Date(),
        isHistory: false
      }
      
      // Notify all registered handlers
      this.messageHandlers.forEach(handler => handler(roomMessage))
    })
  }

  /**
   * Register a handler for room messages
   * @param handler The handler function to call when a message is received
   */
  onRoomMessage(handler: RoomMessageHandler): void {
    this.messageHandlers.push(handler)
  }

  /**
   * Remove a message handler
   * @param handler The handler function to remove
   */
  offRoomMessage(handler: RoomMessageHandler): void {
    const index = this.messageHandlers.indexOf(handler)
    if (index !== -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  /**
   * Get the PubSub service JID for the server
   * @param server The server domain
   * @returns Promise resolving to the PubSub service JID or null if not found
   */
  async getPubSubService(server: string): Promise<string | null> {
    if (!this.client || !this.connected) {
      return null
    }

    try {
      const items = await this.client.getDiscoItems(server)
      
      // Look for pubsub service in items
      for (const item of items.items) {
        if (item.jid && item.jid.includes('pubsub')) {
          return item.jid
        }
      }
      
      // If not found in items, try the standard pubsub subdomain
      return `pubsub.${server}`
    } catch (error) {
      console.error('Error discovering PubSub service:', error)
      return null
    }
  }

  /**
   * List all PubSub documents (nodes) from a service
   * @param pubsubService The PubSub service JID
   * @returns Promise resolving to array of PubSubDocument objects
   */
  async listPubSubNodes(pubsubService: string): Promise<PubSubDocument[]> {
    if (!this.client || !this.connected) {
      return []
    }

    try {
      // Get all nodes from the pubsub service
      const items = await this.client.getDiscoItems(pubsubService)
      
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
   * Create a new PubSub document (node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID for the new node
   * @param config Configuration options for the node
   * @param content Optional initial content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async createPubSubDocument(pubsubService: string, nodeId: string, config: PubSubOptions, content?: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Create the node

      await this.client.createNode(pubsubService, nodeId, config)
      
      // If content is provided, publish it to the node
      if (content) {
        // For StanzaJS, we need to provide a proper XML payload
        // The third parameter is for item attributes, and fourth is the payload
        await this.client.publish(pubsubService, nodeId, content)
      }
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error creating PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Update a PubSub document (publish to a node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to update
   * @param content The new content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async updatePubSubDocument(pubsubService: string, nodeId: string, content: string): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Publish to the node
      // For StanzaJS, we need to provide a proper XML payload
      await this.client.publish(pubsubService, nodeId, {}, `<content>${content}</content>`)
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error updating PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Update a JSON document in a PubSub node
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to update
   * @param content The new JSON content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async publishJsonToPubSubNode(pubsubService: string, nodeId: string, content: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Publish the JSON content to the node
      const result = await this.client.publish(pubsubService, nodeId, content)
      console.log('publish complete', nodeId, result)
      
      return { success: true, id: nodeId, itemId: result.id }
    } catch (error) {
      console.error(`Error publishing JSON to PubSub node ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Delete a PubSub document (node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to delete
   * @returns Promise resolving to PubSubDocumentResult
   */
  async deletePubSubDocument(pubsubService: string, nodeId: string): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Delete the node
      await this.client.deleteNode(pubsubService, nodeId)
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error deleting PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Alias for deletePubSubDocument - Delete a PubSub node
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to delete
   * @returns Promise resolving to PubSubDocumentResult
   */
  async deletePubSubNode(pubsubService: string, nodeId: string): Promise<PubSubDocumentResult> {
    return this.deletePubSubDocument(pubsubService, nodeId)
  }

  /**
   * Subscribe to a PubSub document (node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to subscribe to
   * @returns Promise resolving to PubSubSubscribeResult
   */
  async subscribeToPubSubDocument(pubsubService: string, nodeId: string): Promise<PubSubSubscribeResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Set up the PubSub event handler if not already done
      this.setupPubSubEventHandler()

      // check we aren't already subscribed to this node
      if (this.subscriptionIds.has(nodeId)) {
        console.log('already subscribed')
        return { success: false, id: nodeId, error: 'Already subscribed' }
      }
      
      // Subscribe to the node
      const result = await this.client.subscribeToNode(pubsubService, nodeId)

      console.log('subscribed!', result)
      
      // Store the subscription ID for later use when unsubscribing
      if (result && result.subid) {
        this.subscriptionIds.set(nodeId, result.subid)
      }
      
      return { success: true, id: nodeId, subscriptionId: result?.subid }
    } catch (error) {
      console.error(`Error subscribing to PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Unsubscribe from a PubSub document (node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to unsubscribe from
   * @returns Promise resolving to PubSubDocumentResult
   */
  async unsubscribeFromPubSubDocument(pubsubService: string, nodeId: string): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      // Get the subscription ID if available
      const subid = this.subscriptionIds.get(nodeId)
      
      // Unsubscribe from the node with the subscription ID if available
      if (subid) {
        await this.client.unsubscribeFromNode(pubsubService, {
          node: nodeId,
          subid
        })
        
        // Remove the subscription ID from the map
        this.subscriptionIds.delete(nodeId)
      } else {
        // Try without subscription ID, but this might fail
        try {
          await this.client.unsubscribeFromNode(pubsubService, nodeId)
        } catch (e) {
          // Ignore the error if it's about missing subscription ID
          const error = e as { pubsubError?: string }
          if (error?.pubsubError !== 'subid-required') {
            throw e
          }
        }
      }
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error unsubscribing from PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get the content of a PubSub document (node)
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to get content from
   * @returns Promise resolving to PubSubDocument or null if not found
   */
  async getPubSubDocument(pubsubService: string, nodeId: string): Promise<PubSubDocument | null> {
    if (!this.client || !this.connected) {
      return null
    }

    try {
      // TODO: using paging to only retrieve the last item from the node
      
      // Get the items from the node
      const result = await this.client.getItems(pubsubService, nodeId)

      if (result.items && result.items.length > 0) {
        const item = result.items[0] as PubSubDocument
        return item
      }
      
      return null
    } catch (error) {
      console.error(`Error getting PubSub document ${nodeId}:`, error)
      return null
    }
  }

  // Define the pubsub event handler function
  private pubsubEventHandler = (message: Message) => {
    console.log('item updated!', message)
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
    this.pubsubChangeHandlers.forEach(handler => handler(document))
  }

  /**
   * Set up the event handler for PubSub events
   */
  private setupPubSubEventHandler(): void {
    if (!this.client) return

    // Check if this handler is already registered
    const existingListeners = this.client.listeners('pubsub:published')
    
    // Only add the listener if it's not already present
    if (!existingListeners.some(listener => listener.toString() === this.pubsubEventHandler.toString())) {
      console.log('registering handler')
      this.client.on('pubsub:published', this.pubsubEventHandler)
    }
  }

  /**
   * Register a handler for PubSub document changes
   * @param handler The handler function to call when a document changes
   */
  onPubSubDocumentChange(handler: PubSubDocumentChangeHandler): void {
    this.setupPubSubEventHandler()
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
   * Create a child node within a collection node
   * @param pubsubService The PubSub service JID
   * @param parentNodeId The ID of the parent collection node
   * @param childNodeId The ID for the new child node
   * @param config Configuration options for the child node
   * @param content Optional initial content for the child node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async createPubSubChildNode(pubsubService: string, parentNodeId: string, childNodeId: string, config: PubSubOptions, content?: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: childNodeId, error: 'Not connected' }
    }

    try {
      // Create the child node with collection association
      const childConfig = {
        ...config,
        collection: parentNodeId
      }
      
      // Create the node with parent association
      await this.client.createNode(pubsubService, childNodeId, childConfig)
      
      // If content is provided, publish it to the node
      if (content) {
        await this.client.publish(pubsubService, childNodeId, content)
      }
      
      return { success: true, id: childNodeId }
    } catch (error) {
      console.error(`Error creating PubSub child node ${childNodeId} in collection ${parentNodeId}:`, error)
      return { success: false, id: childNodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get the configuration of a PubSub node
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to get configuration for
   * @returns Promise resolving to PubSubOptions containing the node configuration
   */
  async getPubSubNodeConfig(pubsubService: string, nodeId: string): Promise<PubSubOptions> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected')
    }

    try {
      // Get the node configuration using StanzaJS
      const result = await this.client.getNodeConfig(pubsubService, nodeId)
      
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
   * Alias for getPubSubNodeConfig - Get the configuration of a PubSub node
   * @param pubsubService The PubSub service JID
   * @param nodeId The ID of the node to get configuration for
   * @returns Promise resolving to PubSubOptions containing the node configuration
   */
  async getNodeConfig(pubsubService: string, nodeId: string): Promise<PubSubOptions> {
    return this.getPubSubNodeConfig(pubsubService, nodeId)
  }
}
