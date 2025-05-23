import { Agent } from 'stanza'
import { DiscoInfoResult, PubsubSubscriptions, ReceivedPresence } from 'stanza/protocol'
import { GameMessage, User } from '../../types/rooms-d'

import * as muc from './muc'
import { ConnectionService } from './connection'
import { PresenceService } from './presence'
import { PubSubService } from './pubsub'
import { PubSubDocumentChangeHandler, PresenceHandler, Room, RoomMessageHandler, JoinRoomResult, LeaveRoomResult, SendMessageResult, PubSubDocument, PubSubDocumentResult, PubSubSubscribeResult, PubSubOptions, RoomChangeListener } from '../types'

/**
 * Special constant for registering handlers that listen to messages from all rooms
 */
export const ALL_ROOMS = 'all-rooms'

/**
 * Service for handling XMPP connections and communications
 */
export class XMPPService {
  public client: Agent | null = null
  private connectionService: ConnectionService
  private mucService: muc.MUCService
  public pubsubService: PubSubService
  private presenceService: PresenceService
  
  // State properties needed by the services
  public connected = false
  public bareJid = ''
  public jid = ''
  public server = ''
  public presenceHandlers: Map<string, PresenceHandler[]> = new Map()

  constructor() {
    this.connectionService = new ConnectionService(this)
    this.mucService = new muc.MUCService(this)
    this.pubsubService = new PubSubService(this)
    this.presenceService = new PresenceService(this)
  }

  set pubsubServiceUrl(url: string | null) {
    this.pubsubService.pubsubServiceUrl = url
  }

  get pubsubServiceUrl(): string | null {
    return this.pubsubService.pubsubServiceUrl
  }

  set mucServiceUrl(url: string | null) {
    this.mucService.mucServiceUrl = url
  }

  get mucServiceUrl(): string | null {
    return this.mucService.mucServiceUrl
  }

  // Connection methods
  /**
   * Establishes a connection to the XMPP server.
   * @param ip The IP address of the XMPP server.
   * @param host The hostname of the XMPP server.
   * @param username The username for the XMPP account.
   * @param password The password for the XMPP account.
   * @returns A boolean indicating whether the connection was successful.
   */
  async connect(ip: string, host: string, username: string, password: string): Promise<boolean> {
    return this.connectionService.connect(ip, host, username, password)
  }

  async disconnect(): Promise<void> {
    return this.connectionService.disconnect()
  }

  isConnected(): boolean {
    return this.connectionService.isConnected()
  }

  getJID(): string {
    return this.connectionService.getJID()
  }

  async discoverServerFeatures(): Promise<DiscoInfoResult | null> {
    return this.connectionService.discoverServerFeatures()
  }

  async serverSupportsFeature(feature: string): Promise<boolean> {
    return this.connectionService.serverSupportsFeature(feature)
  }

  async supportsMUC(): Promise<boolean> {
    return this.mucService.supportsMUC()
  }

  async supportsPubSub(): Promise<boolean> {
    return this.pubsubService.supportsPubSub()
  }

  async getMUCService(): Promise<string | null> {
    return this.mucService.getMUCService()
  }

  async getPubSubService(): Promise<string | null> {
    return this.pubsubService.getPubSubService()
  }

  // MUC methods
  async listRooms(): Promise<Room[]> {
    return this.mucService.listRooms()
  }

  async joinRoom(
    roomJid: string, 
    messageHandler?: RoomMessageHandler, 
    suppressErrors: boolean = false
  ): Promise<JoinRoomResult> {
    return this.mucService.joinRoom(roomJid, messageHandler, suppressErrors)
  }

  async leaveRoom(roomJid: string, messageHandler?: RoomMessageHandler | null): Promise<LeaveRoomResult> {
    return this.mucService.leaveRoom(roomJid, messageHandler)
  }

  async getJoinedRooms(): Promise<string[]> {
    return this.mucService.getJoinedRooms()
  }

  async sendRoomMessage(body: GameMessage): Promise<SendMessageResult> {
    return this.mucService.sendRoomMessage(body)
  }

  setupRoomMessageHandler(): void {
    this.mucService.setupRoomMessageHandler()
  }

  onRoomMessage(handler: RoomMessageHandler, roomJid?: string): void {
    this.mucService.onRoomMessage(handler, roomJid)
  }

  offRoomMessage(handler: RoomMessageHandler, roomJid?: string): void {
    this.mucService.offRoomMessage(handler, roomJid)
  }

  async getRoomMembers(roomJid: string): Promise<User[]> {
    return this.mucService.getRoomMembers(roomJid)
  }

  // PubSub methods
  async listPubSubNodes(): Promise<PubSubDocument[]> {
    return this.pubsubService.listPubSubNodes()
  }

  async getPubSubCollectionItems(nodeId: string): Promise<PubSubDocument[]> {
    return this.pubsubService.getPubSubCollectionItems(nodeId)
  }

  async createPubSubCollection(nodeId: string): Promise<PubSubDocumentResult> {
    return this.pubsubService.createPubSubCollection(nodeId)
  }

  async publishPubSubLeaf(nodeId: string, collection: string | undefined, content?: Record<string, unknown>): Promise<PubSubDocumentResult> {
    return this.pubsubService.publishPubSubLeaf(nodeId, collection, content)
  }

  async publishJsonToPubSubNode(nodeId: string, content: Record<string, unknown>): Promise<PubSubDocumentResult> {
    return this.pubsubService.publishJsonToPubSubNode(nodeId, content)
  }

  async deletePubSubDocument(nodeId: string): Promise<PubSubDocumentResult> {
    return this.pubsubService.deletePubSubDocument(nodeId)
  }

  async subscribeToPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler): Promise<PubSubSubscribeResult> {
    return this.pubsubService.subscribeToPubSubDocument(nodeId, handler)
  }

  async unsubscribeFromPubSubDocument(nodeId: string, handler?: PubSubDocumentChangeHandler, subscriptionId?: string): Promise<PubSubDocumentResult> {
    return this.pubsubService.unsubscribeFromPubSubDocument(nodeId, handler, subscriptionId)
  }

  async clearPubSubSubscriptions(): Promise<PubsubSubscriptions | null> {
    return this.pubsubService.clearPubSubSubscriptions()
  }

  async getPubSubDocument(nodeId: string): Promise<PubSubDocument | null> {
    return this.pubsubService.getPubSubDocument(nodeId)
  }

  setupPubSubEventHandler(): void {
    this.pubsubService.setupPubSubEventHandler()
  }

  onPubSubDocumentChange(handler: PubSubDocumentChangeHandler): void {
    this.pubsubService.onPubSubDocumentChange(handler)
  }

  offPubSubDocumentChange(handler: PubSubDocumentChangeHandler): void {
    this.pubsubService.offPubSubDocumentChange(handler)
  }

  async checkPubSubNodeExists(nodeId: string): Promise<boolean> {
    return this.pubsubService.checkPubSubNodeExists(nodeId)
  }

  async getPubSubNodeConfig(nodeId: string): Promise<PubSubOptions> {
    return this.pubsubService.getPubSubNodeConfig(nodeId)
  }

  async updateUserForceId(bareJid: string, forceId: string | undefined): Promise<void> {
    return this.pubsubService.updateUserForceId(bareJid, forceId)
  }

  // Presence methods
  subscribeToPresence(roomJid: string, handler: PresenceHandler): () => void {
    return this.presenceService.subscribeToPresence(roomJid, handler)
  }

  /**
   * Subscribe to room change events for the current user
   * @param listener The listener function to call when the current user is added to or removed from a room
   * @returns A function to unsubscribe from room change events
   */
  subscribeToRoomChanges(listener: RoomChangeListener): () => void {
    return this.presenceService.subscribeToRoomChanges(listener)
  }

  handlePresenceUpdate(presence: ReceivedPresence): void {
    this.presenceService.handlePresenceUpdate(presence)
  }
}
