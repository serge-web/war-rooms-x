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
  useMock: boolean
  setUseMock: (value: boolean) => void
}

/**
 * User representation from OpenFire
 */
export interface UserDetailsType {
  username: string
  name?: string
  email?: string
  properties?: Record<string, string> // privileges can be stored in here
}

export interface ForceDetails {
  fullName: string
  color?: string
}

export interface ForceType {
  name: string
  description?: string // can a stringified ForceDetails object
}