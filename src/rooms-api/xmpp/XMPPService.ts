import * as XMPP from 'stanza'
import { Agent } from 'stanza'

/**
 * Interface for XMPP Service Discovery Info Data
 */
interface DiscoInfo {
  features: string[]
  identities: Array<{
    category: string
    type: string
    name?: string
  }>
  extensions?: any[]
}

/**
 * Service for handling XMPP connections and communications
 */
export class XMPPService {
  private client: Agent | null = null
  private connected = false
  private jid = ''

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
  async discoverServerFeatures(server: string): Promise<DiscoInfo | null> {
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
}
