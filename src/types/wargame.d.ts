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
  playerForce: ForceType | null
  setPlayerForce: (value: ForceType | null) => void
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

export interface ForceType {
  name: string
  description?: string
}

/**
 * Room/Channel representation from OpenFire
 */
export interface RoomType {
  roomName: string
  naturalName?: string
  description?: string
  subject?: string
}