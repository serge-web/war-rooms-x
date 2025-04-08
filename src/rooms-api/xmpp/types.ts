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
 * Represents a message in a MUC room
 */
export interface RoomMessage {
  id: string
  roomJid: string
  from: string
  body: string
  timestamp: Date
  isHistory?: boolean
  delay?: Date
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
export type RoomMessageHandler = (message: RoomMessage) => void
