import * as XMPP from 'stanza'
import { Agent } from 'stanza'
import { DiscoInfoResult, DiscoItem } from 'stanza/protocol'
import { JoinRoomResult, LeaveRoomResult, Room, RoomMessage, RoomMessageHandler, SendMessageResult } from './types'

/**
 * Service for handling XMPP connections and communications
 */
export class XMPPService {
  private client: Agent | null = null
  private connected = false
  private jid = ''
  private joinedRooms: Set<string> = new Set()
  private messageHandlers: RoomMessageHandler[] = []

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
      
      // Leave the room - note that StanzaJS leaveRoom returns void, not a Promise
      this.client.leaveRoom(roomJid, nickname, {})
      
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
}
