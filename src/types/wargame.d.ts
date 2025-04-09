export interface GameStateType {
  turn: number
  currentTime: string
  currentPhase: string
}


export interface WargameContextType {
  loggedIn: boolean
  setLoggedIn: (value: boolean) => void
  gameState: GameStateType | null
  setGameState: (value: GameStateType | null) => void
  rooms: RoomType[]
  setRooms: (value: RoomType[]) => void
  playerForce: ForceDetails | null
  setPlayerForce: (value: ForceDetails | null) => void
  playerDetails: UserDetailsType | null
  setPlayerDetails: (value: UserDetailsType | null) => void
}

/**
 * User representation from OpenFire
 */
export interface UserDetailsType {
  username: string
  name?: string
  email?: string
  properties?: Record<string, string>
}

export interface ForceDetails {
  fullName: string
  color?: string
}

export interface ForceType {
  name: string
  description?: string
}

export interface RoomDetails {
  roomType: 'chat' | 'map'
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

export interface Room {
  id: string
  name: string
  unreadCount: number
  messages: Message[]
}