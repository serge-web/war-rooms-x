import { Message } from 'stanza/protocol'

// Export types needed for the XMPP service
export interface PresenceHandler {
  (userJid: string, available: boolean): void
}

export interface RoomMessageHandler {
  (message: Message): void
}

export interface Room {
  jid: string
  name: string
}

export interface User {
  jid: string
  name: string
}

export interface JoinRoomResult {
  success: boolean
  roomJid: string
  error?: string
}

export interface LeaveRoomResult {
  success: boolean
  roomJid: string
  error?: string
}

export interface SendMessageResult {
  success: boolean
  id: string
  error?: string
}

export interface PubSubDocument {
  id: string
  name?: string
  content?: Record<string, unknown>
}

export interface PubSubDocumentResult {
  success: boolean
  id: string
  itemId?: string
  error?: string
}

export interface PubSubSubscribeResult {
  success: boolean
  id: string
  subscriptionId?: string
  error?: string
}

export interface PubSubOptions {
  'pubsub#node_type': 'leaf' | 'collection'
  'pubsub#access_model': 'open' | 'authorise'
}

export interface PubSubDocumentChangeHandler {
  (document: PubSubDocument): void
}

export interface VCardData {
  jid: string
  fullName: string
  name?: {
    family?: string
    given?: string
    middle?: string
    prefix?: string
    suffix?: string
  }
  nickname?: string
  email?: string
  organization?: string
  title?: string
  photo?: string
  role?: string
}
