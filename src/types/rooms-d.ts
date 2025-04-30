import { ThemeConfig } from 'antd'
import { RJSFSchema, UiSchema } from '@rjsf/utils'

export interface RoomDetails {
  roomType: 'chat' | 'map'
  theme?: ThemeConfig
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
  messageType: 'chat' | 'map'
  senderId: string
  senderName: string
  senderForce: string
  turn: string
  phase: string
  timestamp: string
  channel: string
}

export interface ChatMessage {
  value: string
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

export interface UserError {
  title: string, 
  message: string
}

export interface User {
  jid: string
  name: string
}

export interface CustomRoomConfig {
  roomType: string
}

export interface ChatRoomConfig  extends CustomRoomConfig {
  roomType: 'chat'
}

export interface MapRoomConfig extends CustomRoomConfig {
  roomType: 'map'
}

export interface Template {
  name: string
  schema: RJSFSchema
  uiSchema: UiSchema
}

export interface FormRoomConfig extends CustomRoomConfig {
  roomType: 'form'
  templates: Template[]
}