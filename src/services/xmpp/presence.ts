import { ReceivedPresence, MUCInfo } from 'stanza/protocol'
import { PresenceHandler } from '../types'
import { XMPPService } from './index'

/**
 * Service for handling presence updates
 */
export class PresenceService {
  private xmppService: XMPPService

  constructor(xmppService: XMPPService) {
    this.xmppService = xmppService
  }

  /**
   * Subscribe to presence updates for a room
   * @param roomJid The JID of the room
   * @param handler The handler function to call when presence updates
   * @returns A function to unsubscribe from presence updates
   */
  public subscribeToPresence(roomJid: string, handler: PresenceHandler): () => void {
    // Set up the presence event listener if it's not already set up
    if (this.xmppService.client && this.xmppService.presenceHandlers.size === 0) {
      this.xmppService.client.on('presence', this.handlePresenceUpdate.bind(this))
    }
    
    // Initialize the presence handlers map for this room if it doesn't exist
    if (!this.xmppService.presenceHandlers.has(roomJid)) {
      this.xmppService.presenceHandlers.set(roomJid, [])
    }

    // Add the handler to the list for this room
    const handlers = this.xmppService.presenceHandlers.get(roomJid) || []
    handlers.push(handler)
    this.xmppService.presenceHandlers.set(roomJid, handlers)
    
    // Return a function to unsubscribe from presence updates
    return () => {
      // Get the current handlers for this room
      const currentHandlers = this.xmppService.presenceHandlers.get(roomJid) || []
      
      // Filter out the handler we want to remove
      const updatedHandlers = currentHandlers.filter(h => h !== handler)
      
      // If there are no handlers left, remove the room from the map
      if (updatedHandlers.length === 0) {
        this.xmppService.presenceHandlers.delete(roomJid)
      } else {
        // Otherwise, update the handlers list for this room
        this.xmppService.presenceHandlers.set(roomJid, updatedHandlers)
      }
    }
  }
  
  /**
   * Handle presence updates from the XMPP server
   * @param presence The presence stanza
   */
  public handlePresenceUpdate(presence: ReceivedPresence): void {
    if (!presence || !presence.from) {
      console.warn('no presence or from')
      return
    }
    
    const from = presence.from
    const available = presence.type !== 'unavailable'

    if (presence.muc) {
      const mucData = presence.muc as MUCInfo
      if (mucData.statusCodes?.includes('110')) {
        // message refers to current user
        return
      }
    }

    // Extract the room JID
    
    // Check if this is a MUC presence update
    const isMucPresence = from.includes('@conference.')
    if (isMucPresence) {
      
      const parts = from.split('/')
      const roomJid = parts[0]
      const userJid = from.split('/')[1].split('@')[0]
        // Notify handlers for this room
      const roomHandlers = this.xmppService.presenceHandlers.get(roomJid) || []

      for (const handler of roomHandlers) {
        handler(userJid, available)
      }
    } else {
      const userJid = from.split('@')[0]
        // This is a direct presence update
      // Notify all handlers that might be interested
      console.log('direct presence update', from, available)
      for (const [, handlers] of this.xmppService.presenceHandlers.entries()) {
        for (const handler of handlers) {
          handler(userJid, available)
        }
      }
    }
  }
}
