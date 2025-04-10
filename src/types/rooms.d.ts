

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

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

export interface MockRoom {
  id: string
  name: string
  unreadCount: number
  messages: Message[]
  theme?: ThemConfig
}