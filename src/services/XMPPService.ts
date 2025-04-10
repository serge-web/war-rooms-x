import * as XMPP from 'stanza'
import { Agent } from 'stanza'
import { DiscoInfoResult, DiscoItem, JSONItem, Message, PubsubEvent, PubsubSubscriptions, VCardTemp } from 'stanza/protocol'
import { JoinRoomResult, LeaveRoomResult, PubSubDocument, PubSubDocumentChangeHandler, PubSubDocumentResult, PubSubOptions, PubSubSubscribeResult, Room, RoomMessage, RoomMessageHandler, SendMessageResult, VCardData } from './types'

/**
 * Service for handling XMPP connections and communications
 */
export class XMPPService {
  private client: Agent | null = null
  private connected = false
  private jid = ''
  public bareJid = ''
  private server = ''
  private joinedRooms: Set<string> = new Set()
  private messageHandlers: RoomMessageHandler[] = []
  private pubsubChangeHandlers: PubSubDocumentChangeHandler[] = []
  private subscriptionIds: Map<string, string> = new Map() // Map of nodeId to subscriptionId
  public pubsubService: string | null = null
  public mucService: string | null = null

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
          this.bareJid = this.jid.split('/')[0]
          this.server = host
          
          // Set up PubSub event handler when connection is established
          this.setupPubSubEventHandler()

          // check if pubsub is enabled
          if (this.client) {
            this.supportsMUC().then(res => {
              if (res) {
                // get the muc service
                this.getMUCService().then(service => {
                  if (service) {
                    this.mucService = service
                  }
                })
              }
            })
            // do pubsub last, since that's what we're 
            // waiting for before marking client as `live`
            this.supportsPubSub().then(res => {
              if (res) {
                // get the pubsub service
                this.getPubSubService().then(service => {
                  if (service) {
                    this.pubsubService = service
                  }
                })
              }
            })
          }

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
   * @returns Promise resolving to discovery info data
   */
  async discoverServerFeatures(): Promise<DiscoInfoResult | null> {
    if (!this.client || !this.connected || !this.server) {
      return null
    }

    try {
      return await this.client.getDiscoInfo(this.server)
    } catch (error) {
      console.error('Error discovering server features:', error)
      return null
    }
  }

  /**
   * Check if the server supports a specific feature
   * @param feature The feature namespace to check for
   * @returns Promise resolving to boolean indicating if feature is supported
   */
  async serverSupportsFeature(feature: string): Promise<boolean> {
    const info = await this.discoverServerFeatures()
    if (!info) return false
    
    return info.features.some(f => f.startsWith(feature))
  }

  /**
   * Check if the server supports MUC (Multi-User Chat)
   * @returns Promise resolving to boolean indicating if MUC is supported
   */
  async supportsMUC(): Promise<boolean> {
    if (!this.server) return false
    
    // First try direct feature detection
    const directSupport = await this.serverSupportsFeature('http://jabber.org/protocol/muc')
    if (directSupport) return true
    
    // If not found directly, check for MUC service
    try {
      if (this.client) {
        const items = await this.client.getDiscoItems(this.server)
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
   * @returns Promise resolving to boolean indicating if PubSub is supported
   */
  async supportsPubSub(): Promise<boolean> {
    // Check for any pubsub-related feature
    const info = await this.discoverServerFeatures()
    if (!info) return false
    
    return info.features.some(feature => feature.includes('pubsub'))
  }

  /**
   * Get the MUC (conference) service JID for the server
   * @returns Promise resolving to the MUC service JID or null if not found
   */
  async getMUCService(): Promise<string | null> {
    if (!this.client || !this.connected || !this.server) {
      return null
    }

    try {
      const items = await this.client.getDiscoItems(this.server)
      
      // Look for conference/muc service in items
      for (const item of items.items) {
        if (item.jid && (item.jid.includes('conference') || item.jid.includes('muc'))) {
          return item.jid
        }
      }
      
      // If not found in items, try the standard conference subdomain
      return `conference.${this.server}`
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
      
      if (!this.mucService) {
        console.error('Could not find MUC service')
        return []
      }
      
      const items = await this.client.getDiscoItems(this.mucService)
      
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
      // Set up message handler for this room if not already done
      this.setupRoomMessageHandler()
      
      // Join the room
      await this.client.joinRoom(roomJid, this.bareJid)
      
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
      
      // retrieve history for this room, if necessary
      const startTime = new Date().getTime()
      const messages: XMPP.Stanzas.Forward[] = []
      const setMessages = (newMessages: XMPP.Stanzas.Forward[]) => {
        messages.push(...newMessages)
      }

      console.log('getting messages for', roomJid)

      // implement actual history retrieval
      const getHistory = (jid: string, start: number, entries: XMPP.Stanzas.Forward[]) => {
        // capture the page size and the start index
        // TODO: currently the `count` is being ignored
        const pOpts: Partial<XMPP.MAMQueryOptions> = {
          paging: {count: 10, index: start}
        }
        // const time = new Date().getTime()
        console.log('getting more results', jid, start)
        this.client!.searchHistory(jid, pOpts).then((results) => {
          const msgs:XMPP.Stanzas.Forward[] = results.results?.map((msg) => msg.item as XMPP.Stanzas.Forward) || []
          console.log('received batch', msgs, results)
          const numReceived = results.results?.length || 0
          // const elapsedSecs = (new Date().getTime() - time) / 1000
          // console.log('got history after secs', elapsedSecs, jid, start, msgs.length, results)
          entries.push(...msgs)
          // msgs.forEach((msg) => {
          //   // console.log('history entry', msg.delay?.timestamp, msg.message?.id)
          // })
          if (!results.complete) {
            console.log('about to get another batch')
            getHistory(jid, start + numReceived, entries)
          } else {
            const elapsedSecs = (new Date().getTime() - startTime) / 1000
            console.log('History received for', jid.split('@')[0] + ' (' + entries.length, 'msgs in', elapsedSecs, 'secs)')
            setMessages(entries)
          }
          return entries
        }).catch((err) => {
          console.error('getHistory error', jid, err)
        })
      }
      getHistory(roomJid, 0, [])

      console.log('messages retrieved', messages.length)

      return messages.map((msg) => ({
        id: msg.message?.id || '',
        roomJid: roomJid,
        from: msg.message?.from || '',
        body: msg.message?.body || '',
        timestamp: msg.delay?.timestamp || new Date(),
        isHistory: true
      }))
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
   * @returns Promise resolving to the PubSub service JID or null if not found
   */
  async getPubSubService(): Promise<string | null> {
    if (!this.client || !this.connected || !this.server) {
      return null
    }

    try {
      const items = await this.client.getDiscoItems(this.server)
      
      // Look for pubsub service in items
      for (const item of items.items) {
        if (item.jid && item.jid.includes('pubsub')) {
          return item.jid
        }
      }
      
      // If not found in items, try the standard pubsub subdomain
      return `pubsub.${this.server}`
    } catch (error) {
      console.error('Error discovering PubSub service:', error)
      return null
    }
  }

  /**
   * List all PubSub documents (nodes) from the server's PubSub service
   * @returns Promise resolving to array of PubSubDocument objects
   */
  async listPubSubNodes(): Promise<PubSubDocument[]> {
    if (!this.client || !this.connected) {
      return []
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Get all nodes from the pubsub service
      const items = await this.client.getDiscoItems(this.pubsubService)
      
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
   * @param nodeId The ID for the new node
   * @param config Configuration options for the node
   * @param content Optional initial content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async createPubSubDocument(nodeId: string, config: PubSubOptions, content?: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Create the node
      await this.client.createNode(this.pubsubService, nodeId, config)
      
      // If content is provided, publish it to the node
      if (content) {
        // For StanzaJS, we need to provide a proper XML payload
        // The third parameter is for item attributes, and fourth is the payload
        await this.client.publish(this.pubsubService, nodeId, content)
      }
      
      return { success: true, id: nodeId }
    } catch (error) {
      if ((error as {error: {condition: string}}).error?.condition === 'conflict') {
        // don't worry ,it's already there
        return { success: true, id: nodeId }
      } else {
        console.error(`Error creating PubSub document ${nodeId}:`, error)
        return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }  
      }
    }
  }

  /**
   * Update a PubSub document (publish to a node)
   * @param nodeId The ID of the node to update
   * @param content The new content for the node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async updatePubSubDocument(nodeId: string, content: string): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Publish to the node
      // For StanzaJS, we need to provide a proper XML payload
      await this.client.publish(this.pubsubService, nodeId, {}, `<content>${content}</content>`)
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error updating PubSub document ${nodeId}:`, error)
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
  async publishJsonToPubSubNode(nodeId: string, content: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Publish the JSON content to the node
      const result = await this.client.publish(this.pubsubService, nodeId, content)
      
      // Manually trigger the document change event for local subscribers
      // This ensures that our local handlers are notified even if the XMPP server
      // doesn't send a notification back to the publisher
      const document: PubSubDocument = {
        id: nodeId,
        content: content
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
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Delete the node
      await this.client.deleteNode(this.pubsubService, nodeId)
      
      return { success: true, id: nodeId }
    } catch (error) {
      console.error(`Error deleting PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Alias for deletePubSubDocument - Delete a PubSub node
   * @param nodeId The ID of the node to delete
   * @returns Promise resolving to PubSubDocumentResult
   */
  async deletePubSubNode(nodeId: string): Promise<PubSubDocumentResult> {
    return this.deletePubSubDocument(nodeId)
  }

  /**
   * Subscribe to a PubSub document (node) and register a change handler
   * @param nodeId The ID of the node to subscribe to
   * @param handler Optional handler function to call when the document changes
   * @returns Promise resolving to PubSubSubscribeResult
   */
  async subscribeToPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubSubscribeResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Set up the PubSub event handler if not already done
      this.setupPubSubEventHandler()

      // check we aren't already subscribed to this node
      if (this.subscriptionIds.has(nodeId)) {
        return { success: false, id: nodeId, error: 'Already subscribed' }
      }
      
      // Subscribe to the node
      const result = await this.client.subscribeToNode(this.pubsubService, nodeId)
      
      // Store the subscription ID for later use when unsubscribing
      if (result && result.subid) {
        this.subscriptionIds.set(nodeId, result.subid)
      }
      
      // Register the handler if provided
      if (handler) {
        this.pubsubChangeHandlers.push(handler)
      }

      // if a handler is provided, and the node exists, call the handler with the current content
      // if (handler) {
      //   const result = await this.client.getItems(this.pubsubService, nodeId)

      //   const content = await this.getPubSubDocument(nodeId)
      //   if (content) {
      //     handler(content)
      //   }
      // }
      
      return { success: true, id: nodeId, subscriptionId: result?.subid }
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
  async unsubscribeFromPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: nodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Get the subscription ID if available
      const subid = this.subscriptionIds.get(nodeId)
      
      // Unsubscribe from the node with the subscription ID if available
      if (subid) {
        await this.client.unsubscribeFromNode(this.pubsubService, {
          node: nodeId,
          subid
        })
        
        // Remove the subscription ID from the map
        this.subscriptionIds.delete(nodeId)
      } else {
        // Try without subscription ID, but this might fail
        try {
          await this.client.unsubscribeFromNode(this.pubsubService, nodeId)
        } catch (e) {
          // Ignore the error if it's about missing subscription ID
          const error = e as { pubsubError?: string }
          if (error?.pubsubError !== 'subid-required') {
            throw e
          }
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
      console.error(`Error unsubscribing from PubSub document ${nodeId}:`, error)
      return { success: false, id: nodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  

  /**
   * Get the subscriptions for current user
   */
  async clearPubSubSubscriptions(): Promise<PubsubSubscriptions | null> {
    if (!this.client || !this.connected) {
      return null
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // TODO: using paging to only retrieve the last item from the node
      
      // Get the items from the node
      const result = await this.client.getSubscriptions(this.pubsubService)
      
      // delete all subscriptions
      if (result && result.items) {
        for (const item of result.items) {
          const subOpts: XMPP.PubsubUnsubscribeOptions = {
            node: item.node,
            subid: item.subid
          }
          await this.client.unsubscribeFromNode(this.pubsubService, subOpts)
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
    if (!this.client || !this.connected) {
      return null
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // TODO: using paging to only retrieve the last item from the node
      
      // Get the items from the node
      const result = await this.client.getItems(this.pubsubService, nodeId)

      if (result.items && result.items.length > 0) {
        const item = result.items[0] as PubSubDocument
        return item
      }
      
      return null
    } catch (error: unknown) {
      // check for item not found
      if(error && (error as { error?: { condition: string } })?.error?.condition === 'item-not-found') {
        return null
      } else {
        console.error(`Error getting PubSub document ${nodeId}:`, error)
        return null  
      }
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
   * @param parentNodeId The ID of the parent collection node
   * @param childNodeId The ID for the new child node
   * @param config Configuration options for the child node
   * @param content Optional initial content for the child node
   * @returns Promise resolving to PubSubDocumentResult
   */
  async createPubSubChildNode(parentNodeId: string, childNodeId: string, config: PubSubOptions, content?: JSONItem): Promise<PubSubDocumentResult> {
    if (!this.client || !this.connected) {
      return { success: false, id: childNodeId, error: 'Not connected' }
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Create the child node with collection association
      const childConfig = {
        ...config,
        collection: parentNodeId
      }
      
      // Create the node with parent association
      await this.client.createNode(this.pubsubService, childNodeId, childConfig)
      
      // If content is provided, publish it to the node
      if (content) {
        await this.client.publish(this.pubsubService, childNodeId, content)
      }
      
      return { success: true, id: childNodeId }
    } catch (error) {
      console.error(`Error creating PubSub child node ${childNodeId} in collection ${parentNodeId}:`, error)
      return { success: false, id: childNodeId, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Get the configuration of a PubSub node
   * @param nodeId The ID of the node to get configuration for
   * @returns Promise resolving to PubSubOptions containing the node configuration
   */
  async getPubSubNodeConfig(nodeId: string): Promise<PubSubOptions> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected')
    }

    try {
      if (!this.pubsubService) {
        throw new Error('PubSub service not available')
      }
      
      // Get the node configuration using StanzaJS
      const result = await this.client.getNodeConfig(this.pubsubService, nodeId)
      
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
   * @param nodeId The ID of the node to get configuration for
   * @returns Promise resolving to PubSubOptions containing the node configuration
   */
  async getNodeConfig(nodeId: string): Promise<PubSubOptions> {
    return this.getPubSubNodeConfig(nodeId)
  }

  /**
   * Get the vCard for the current user
   * @returns Promise resolving to VCardData containing the user's vCard information
   */
  async getCurrentUserVCard(): Promise<VCardData> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected')
    }

    try {
      // Get the vCard for the current user using StanzaJS
      const vCardResult = await this.client.getVCard(this.bareJid) as VCardTemp
      
      // Extract email from records if available
      let email = ''
      let nickname = ''
      let organization = ''
      let title = ''
      let role = ''
      let photo = ''
      
      // Process vCard records to extract relevant information
      if (vCardResult.records) {
        for (const record of vCardResult.records) {
          if (record.type === 'email' && record.value) {
            email = record.value
          } else if (record.type === 'nickname' && record.value) {
            nickname = record.value
          } else if (record.type === 'organization' && record.value) {
            organization = record.value
          } else if (record.type === 'title' && record.value) {
            title = record.value
          } else if (record.type === 'role' && record.value) {
            role = record.value
          } else if (record.type === 'photo' && record.data) {
            // Convert Buffer to base64 string if available
            photo = `data:${record.mediaType || 'image/jpeg'};base64,${record.data.toString('base64')}`
          }
        }
      }
      
      // Convert the StanzaJS vCard format to our VCardData interface
      const vCard: VCardData = {
        jid: this.jid,
        fullName: vCardResult.fullName || '',
        name: vCardResult.name,
        nickname,
        email,
        organization,
        title,
        photo,
        role
      }
      
      return vCard
    } catch (error) {
      console.error('Error getting vCard for current user:', error)
      throw error
    }
  }
  
  /**
   * Get the vCard for a specific user
   * @param jid The JID of the user to get the vCard for
   * @returns Promise resolving to VCardData containing the user's vCard information
   */
  async getUserVCard(jid: string): Promise<VCardData> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected')
    }

    try {
      // Get the vCard for the specified user using StanzaJS
      const vCardResult = await this.client.getVCard(jid) as VCardTemp
      
      // Extract email from records if available
      let email = ''
      let nickname = ''
      let organization = ''
      let title = ''
      let role = ''
      let photo = ''
      
      // Process vCard records to extract relevant information
      if (vCardResult.records) {
        for (const record of vCardResult.records) {
          if (record.type === 'email' && record.value) {
            email = record.value
          } else if (record.type === 'nickname' && record.value) {
            nickname = record.value
          } else if (record.type === 'organization' && record.value) {
            organization = record.value
          } else if (record.type === 'title' && record.value) {
            title = record.value
          } else if (record.type === 'role' && record.value) {
            role = record.value
          } else if (record.type === 'photo' && record.data) {
            // Convert Buffer to base64 string if available
            photo = `data:${record.mediaType || 'image/jpeg'};base64,${record.data.toString('base64')}`
          }
        }
      }
      
      // Convert the StanzaJS vCard format to our VCardData interface
      const vCard: VCardData = {
        jid,
        fullName: vCardResult.fullName || '',
        name: vCardResult.name,
        nickname,
        email,
        organization,
        title,
        photo,
        role
      }
      
      return vCard
    } catch (error) {
      console.error(`Error getting vCard for user ${jid}:`, error)
      throw error
    }
  }
  
  /**
   * Set the vCard for the current user
   * @param vCardData The vCard data to set
   * @returns Promise resolving to true if successful
   */
  async setVCard(vCardData: VCardData): Promise<boolean> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected')
    }

    try {
      // Convert our VCardData to StanzaJS VCardTemp format
      const vCardTemp: VCardTemp = {
        fullName: vCardData.fullName || '',
        name: vCardData.name || {},
        records: []
      }
      
      // Ensure records array is initialized
      if (!vCardTemp.records) {
        vCardTemp.records = []
      }
      
      // Add records based on provided data
      if (vCardData.email) {
        vCardTemp.records.push({
          type: 'email',
          value: vCardData.email
        })
      }
      
      if (vCardData.nickname) {
        vCardTemp.records.push({
          type: 'nickname',
          value: vCardData.nickname
        })
      }
      
      if (vCardData.organization) {
        vCardTemp.records.push({
          type: 'organization',
          value: vCardData.organization
        })
      }
      
      if (vCardData.title) {
        vCardTemp.records.push({
          type: 'title',
          value: vCardData.title
        })
      }
      
      if (vCardData.role) {
        vCardTemp.records.push({
          type: 'role',
          value: vCardData.role
        })
      }
      
      // Handle photo if provided as base64 data URL
      if (vCardData.photo && vCardData.photo.startsWith('data:')) {
        // Extract media type and base64 data
        const matches = vCardData.photo.match(/^data:(.+);base64,(.+)$/)
        if (matches && matches.length === 3) {
          const mediaType = matches[1]
          const base64Data = matches[2]
          const binaryData = Buffer.from(base64Data, 'base64')
          
          vCardTemp.records.push({
            type: 'photo',
            mediaType,
            data: binaryData
          })
        }
      }
      
      // Set the vCard using StanzaJS
      // Note: StanzaJS doesn't have a setVCard method directly on the client
      // We need to use the pubsub:publish event with the vcard-temp namespace
      await this.client.sendIQ({
        type: 'set',
        vcard: vCardTemp
      })
      
      return true
    } catch (error) {
      console.error('Error setting vCard for current user:', error)
      throw error
    }
  }
}
