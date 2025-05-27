import { ThemeConfig } from 'antd'
import { RJSFSchema, UiSchema } from '@rjsf/utils'

/** who can see the presence of others in a room */
export type PresenceVisibility = 'all' | 'umpires-only' | 'none'

export interface RoomDetails {
  theme?: ThemeConfig
  description: string
  specifics?: ChatRoomConfig | MapRoomConfig | FormRoomConfig
  presenceVisibility?: PresenceVisibility
}

/**
 * OpenFire room
 */
export interface RoomType {
  roomName: string
  naturalName?: string
  description?: string // this should be a JSON encoded RoomDetails
  subject?: string
}

export interface MessageDetails {
  messageType: 'chat' | 'map' | 'form'
  senderId: string
  senderName: string
  senderForce: string
  turn: string
  phase: string
  timestamp: string
  channel: string
  editedAt?: string // time of edit
}

export interface ChatMessage {
  value: string
}

export interface FormMessage {
  templateId: string
  data: object
}

export interface GameMessage {
  id: string
  details: MessageDetails
  content: object | ChatMessage
}

export interface XMPPMessage {
  id: string
  sender: string
  content: GameMessage
  timestamp: string
}

export interface MockRoom {
  id: string
  name: string
  unreadCount: number
  messages: GameMessage[]
  theme?: ThemeConfig
}

/** composite title and message, for when we wish to show a modal info dialog. */
export interface UserInfo {
  title: string, 
  message: string,
  type?: 'info' | 'success' | 'warning' | 'error'
}

export interface User {
  jid: string
  name: string
}

export interface OnlineUser {
  id: string
  name?: string
  force?: string
  isOnline: boolean
}

export interface CustomRoomConfig {
  roomType: string
}

export interface ChatRoomConfig  extends CustomRoomConfig {
  roomType: 'chat'
}

export interface MapRoomConfig extends CustomRoomConfig {
  roomType: 'map'
  backdropUrl?: string
}

export interface Template {
  id: string
  schema: RJSFSchema
  uiSchema: UiSchema
}

export interface FormRoomConfig extends CustomRoomConfig {
  roomType: 'form'
  templateIds: Array<Template['id']>
}