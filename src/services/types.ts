import { DataForm, JSONItem, PubsubItem, ReceivedMessage } from "stanza/protocol"

/**
 * Represents vCard data for a user, based on Stanza.js VCardTemp structure
 */
export interface VCardData {
  jid: string
  fullName?: string
  name?: {
    family?: string
    given?: string
    middle?: string
    prefix?: string
    suffix?: string
  }
  nickname?: string
  email?: string
  organization?: string // stringified 
  title?: string
  photo?: string
  role?: string
  birthday?: string
  url?: string
  description?: string
  // Additional vCard fields can be added as needed
}

/**
 * Represents a chat room in the XMPP MUC system
 */
export interface Room {
  jid: string
  name: string
  description?: string
  occupants?: number
  isPasswordProtected?: boolean
}

/**
 * Result of a room join operation
 */
export interface JoinRoomResult {
  success: boolean
  roomJid: string
  error?: string
}

/**
 * Result of a message send operation
 */
export interface SendMessageResult {
  success: boolean
  id: string
  error?: string
}

/**
 * Result of a room leave operation
 */
export interface LeaveRoomResult {
  success: boolean
  roomJid: string
  error?: string
}

/**
 * Message handler function type
 */
export type RoomMessageHandler = (message: ReceivedMessage) => void

/**
 * Represents a PubSub document
 */
export type PubSubDocument = PubsubItem<JSONItem>


export interface PubSubOptions extends DataForm {
  'pubsub#access_model': 'open' | 'authorise'
  'pubsub#node_type': 'leaf' | 'collection'
}

/**
 * Result of a PubSub document operation
 */
export interface PubSubDocumentResult {
  success: boolean
  id: string
  error?: string
  itemId?: string
}

/**
 * Result of a PubSub subscription operation
 */
export interface PubSubSubscribeResult {
  success: boolean
  id: string
  error?: string
  subscriptionId?: string
}

/**
 * PubSub document change handler function type
 */
export type PubSubDocumentChangeHandler = (document: PubSubDocument) => void
