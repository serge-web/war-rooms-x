import * as XMPP from 'stanza'
import { DiscoInfoResult } from 'stanza/protocol'
import { XMPPService } from './index'

/**
 * Service for handling XMPP connection and basic server discovery
 */
export class ConnectionService {
  private xmppService: XMPPService

  constructor(xmppService: XMPPService) {
    this.xmppService = xmppService
  }

  /**
   * Connect to the XMPP server
   * @param ip The XMPP server IP
   * @param host The XMPP server host
   * @param username The username for authentication
   * @param password The password for authentication
   * @returns Promise resolving to true if connection was successful
   */
  async connect(ip: string, host: string, username: string, password: string): Promise<boolean> {
    try {
      this.xmppService.client = XMPP.createClient({
        jid: `${username}@${host}`,
        password,
        transports: {
          websocket: `ws://${ip}:7070/ws/`
        }
      })

      return new Promise<boolean>((resolve) => {
        if (!this.xmppService.client) {
          resolve(false)
          return
        }

        this.xmppService.client.on('session:started', () => {
          this.xmppService.connected = true
          this.xmppService.jid = this.xmppService.client?.jid || ''
          this.xmppService.bareJid = this.xmppService.jid.split('/')[0]
          this.xmppService.server = host
          
          // Set up PubSub event handler when connection is established
          this.xmppService.setupPubSubEventHandler()

          // check if pubsub is enabled
          if (this.xmppService.client) {
            this.xmppService.supportsMUC().then(res => {
              if (res) {
                // get the muc service
                this.xmppService.getMUCService().then(service => {
                  if (service) {
                    this.xmppService.mucServiceUrl = service
                  }
                })
              }
            })
            // do pubsub last, since that's what we're 
            // waiting for before marking client as `live`
            this.xmppService.supportsPubSub().then(res => {
              if (res) {
                // get the pubsub service
                this.xmppService.getPubSubService().then(service => {
                  if (service) {
                    this.xmppService.pubsubServiceUrl = service
                  }
                })
              }
            })

            this.xmppService.client.sendPresence()
          }

          resolve(true)
        })

        this.xmppService.client.on('disconnected', () => {
          this.xmppService.connected = false
        })

        this.xmppService.client.on('auth:failed', () => {
          this.xmppService.connected = false
          resolve(false)
        })

        this.xmppService.client.connect()
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
    if (this.xmppService.client && this.xmppService.connected) {
      // TODO: clear pubsub subscriptions
      this.xmppService.pubsubService.subscriptionIds.forEach(async (subid, nodeId) =>
      {
        if (this.xmppService.pubsubServiceUrl) {
          try {
            await this.xmppService.client?.unsubscribeFromNode(this.xmppService.pubsubServiceUrl, { node: nodeId, subid: subid })
          } catch (error) {
            console.error('Error clearing subscription:', nodeId, subid, error)
          }
        }
      })

      // pause before actually disconnecting
      await new Promise(resolve => setTimeout(resolve, 200))

      // TODO: leave rooms
      this.xmppService.client.disconnect()
      this.xmppService.connected = false
    }
  }

  /**
   * Check if the client is connected to the XMPP server
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.xmppService.connected
  }

  /**
   * Get the JID (Jabber ID) of the connected client
   * @returns The JID string or empty string if not connected
   */
  getJID(): string {
    return this.xmppService.jid
  }

  /**
   * Discover server features and capabilities
   * @returns Promise resolving to discovery info data
   */
  async discoverServerFeatures(): Promise<DiscoInfoResult | null> {
    if (!this.xmppService.client || !this.xmppService.connected || !this.xmppService.server) {
      return null
    }

    try {
      return await this.xmppService.client.getDiscoInfo(this.xmppService.server)
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

}
