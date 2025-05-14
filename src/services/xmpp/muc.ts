import { DiscoItem, Presence } from 'stanza/protocol'
import { GameMessage, User } from '../../types/rooms-d'
import { JoinRoomResult, LeaveRoomResult, Room, RoomMessageHandler, SendMessageResult } from '../types'
import { XMPPService, ALL_ROOMS } from './index'

/**
 * Service for handling Multi-User Chat (MUC) operations
 */
export class MUCService {
  private xmppService: XMPPService
  private joinedRooms: Set<string> = new Set()
  private messageHandlers: Map<string, RoomMessageHandler[]> = new Map()
  public mucServiceUrl: string | null = null


  constructor(xmppService: XMPPService) {
    this.xmppService = xmppService
  }


  /**
   * Check if the server supports MUC (Multi-User Chat)
   * @returns Promise resolving to boolean indicating if MUC is supported
   */
  async supportsMUC(): Promise<boolean> {
    if (!this.xmppService.server) return false

    // First try direct feature detection
    const directSupport = await this.xmppService.serverSupportsFeature('http://jabber.org/protocol/muc')
    if (directSupport) return true
    
    // If not found directly, check for MUC service
    try {
      if (this.xmppService.client) {
        const items = await this.xmppService.client.getDiscoItems(this.xmppService.server)
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
   * Get the MUC (conference) service JID for the server
   * @returns Promise resolving to the MUC service JID or null if not found
   */
  async getMUCService(): Promise<string | null> {
    if (!this.xmppService.client || !this.xmppService.connected || !this.xmppService.server) {
      return null
    }

    try {
      const items = await this.xmppService.client.getDiscoItems(this.xmppService.server)
      
      // Look for conference/muc service in items
      for (const item of items.items) {
        if (item.jid && (item.jid.includes('conference') || item.jid.includes('muc'))) {
          return item.jid
        }
      }
      
      // If not found in items, try the standard conference subdomain
      return `conference.${this.xmppService.server}`
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
    if (!this.xmppService.client || !this.xmppService.connected) {
      return []
    }

    try {
      if (!this.xmppService.mucServiceUrl) {
        console.error('Could not find MUC service')
        return []
      }
      
      const items = await this.xmppService.client.getDiscoItems(this.xmppService.mucServiceUrl)
      
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
   * @param messageHandler Optional handler function to register for room messages
   * @param suppressErrors Optional flag to suppress error logging
   * @returns Promise resolving to JoinRoomResult
   */
  async joinRoom(
    roomJid: string, 
    messageHandler?: RoomMessageHandler, 
    suppressErrors: boolean = false
  ): Promise<JoinRoomResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, roomJid, error: 'Not connected' }
    }

    try {
      // Set up message handler for this room if not already done
      this.setupRoomMessageHandler()

      // Register the message handler if provided
      if (messageHandler) {
        this.onRoomMessage(messageHandler, roomJid)
      }

      // Join the room
      const historyOpts = {
        history: {
          maxStanzas: 20 // number of previous messages to fetch
        } 
      } as unknown as Presence
      await this.xmppService.client.joinRoom(roomJid, this.xmppService.bareJid, historyOpts)
      
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
   * @param messageHandler Optional handler function to unregister (if null, removes all handlers)
   * @returns Promise resolving to LeaveRoomResult
   */
  async leaveRoom(roomJid: string, messageHandler?: RoomMessageHandler | null): Promise<LeaveRoomResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, roomJid, error: 'Not connected' }
    }

    try {
      // Extract the nickname from our JID
      const nickname = this.xmppService.jid.split('@')[0]
      
      // Leave the room - StanzaJS leaveRoom returns void, not a Promise
      // We need to wrap it in a Promise to ensure all operations complete
      await new Promise<void>((resolve) => {
        this.xmppService.client!.leaveRoom(roomJid, nickname, {})
        // Add a small delay to ensure the XMPP operation completes
        setTimeout(resolve, 100)
      })
      
      // Remove from our joined rooms set
      this.joinedRooms.delete(roomJid)
      
      // Unregister message handler if provided
      if (messageHandler) {
        this.offRoomMessage(messageHandler, roomJid)
      } else if (messageHandler === null) {
        // If null is explicitly passed, remove all handlers for this room
        this.messageHandlers.delete(roomJid)
      }
      
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
   * @param body The message body
   * @returns Promise resolving to SendMessageResult
   */
  async sendRoomMessage(body: GameMessage): Promise<SendMessageResult> {
    if (!this.xmppService.client || !this.xmppService.connected) {
      return { success: false, id: '', error: 'Not connected' }
    }

    const roomJid = body.details.channel
    try {
      // Check if we've joined this room
      if (!this.joinedRooms.has(roomJid)) {
        return { success: false, id: '', error: 'Not joined to this room: ' + roomJid }
      }
      
      // Generate a unique ID for the message
      const id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      
      // Send the message
      const res = await this.xmppService.client.sendMessage({
        to: roomJid,
        type: 'groupchat',
        body: JSON.stringify(body),
        id: body.id
      })
      if (!res) {
        return { success: false, id: '', error: 'Failed to send message' }
      }
      return { success: true, id }
    } catch (error) {
      console.error(`Error sending message to room ${roomJid}:`, error)
      return { success: false, id: '', error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Set up the message handler for MUC room messages
   */
  public setupRoomMessageHandler(): void {
    if (!this.xmppService.client) return
    
    // Only set up the handler once
    if (this.xmppService.client.listeners('groupchat').length > 0) return
    
    this.xmppService.client.on('groupchat', (message) => {
      // Skip messages without a body
      if (!message.body) return

      // console.log('groupchat', message)
      
      const roomId = message.from.split('/')[0]
      // Notify handlers registered for this specific room
      const roomHandlers = this.messageHandlers.get(roomId) || []
      roomHandlers.forEach(handler => handler(message))
      
      // Also notify handlers registered for ALL_ROOMS
      const allRoomsHandlers = this.messageHandlers.get(ALL_ROOMS) || []
      allRoomsHandlers.forEach(handler => handler(message))
    })
  }

  /**
   * Register a handler for room messages
   * @param handler The handler function to call when a message is received
   * @param roomJid Optional JID of the room to register the handler for, or ALL_ROOMS to listen to all rooms
   */
  onRoomMessage(handler: RoomMessageHandler, roomJid?: string): void {
    const roomJidVal = roomJid || ALL_ROOMS
    const handlers = this.messageHandlers.get(roomJidVal) || []
    handlers.push(handler)
    this.messageHandlers.set(roomJidVal, handlers)
  }

  /**
   * Remove a message handler
   * @param handler The handler function to remove
   * @param roomJid Optional JID of the room to remove the handler from, or ALL_ROOMS to remove from all rooms listener
   */
  offRoomMessage(handler: RoomMessageHandler, roomJid?: string): void {
    const roomJidVal = roomJid || ALL_ROOMS
    const handlers = this.messageHandlers.get(roomJidVal)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
        if (handlers.length === 0) {
          this.messageHandlers.delete(roomJidVal)
        } else {
          this.messageHandlers.set(roomJidVal, handlers)
        }
      }
    }
  }

  /**
   * Get the list of members (occupants) for a specific MUC room
   * @param roomJid The JID of the room to get members for
   * @returns Promise resolving to an array of room members (User objects)
   */
  async getRoomMembers(roomJid: string): Promise<User[]> {
    if (!this.xmppService.client || !this.xmppService.connected || !this.xmppService.mucServiceUrl) {
      return []
    }

    // Verify the room exists and we've joined it
    if (!this.joinedRooms.has(roomJid)) {
      console.warn(`Cannot get members for room ${roomJid}: not joined`)
      return []
    }

    try {
      // Get the room occupants using disco#items query
      const result = await this.xmppService.client.getDiscoItems(roomJid)
      
      // Map the disco items to User objects
      return result.items.map(item => ({
        jid: item.jid || '',
        name: item.name || (item.jid ? item.jid.split('@')[0] : '')
      }))
    } catch (error) {
      console.error(`Error getting members for room ${roomJid}:`, error)
      return []
    }
  }
}
