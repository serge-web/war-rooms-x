import { DataProvider } from "react-admin"
import { XMPPService } from "../services/XMPPService"
import { PLAN_ADJUDICATE_TURNS, LINEAR_TURNS } from "../types/constants"
import { ThemeConfig } from "antd"
import { RoomType } from "./rooms-d"

export interface GamePropertiesType {
  name: string
  description?: string
  startTime: string
  interval: string
  turnType: typeof PLAN_ADJUDICATE_TURNS | typeof LINEAR_TURNS
  playerTheme?: ThemeConfig
  adminTheme?: ThemeConfig
}

export interface GameStateType {
  turn: string
  currentTime: string
  currentPhase: string
}

export interface MockId {
  playerId: string
  forceId: string
}

export interface GamePlayerDetails {
  id: string
  role: string
  forceId: string
  forceName: string
  forceObjectives?: string
  color?: string
}


export interface WargameContextType {
  loggedIn: boolean
  xmppClient: XMPPService | null | undefined
  setXmppClient: (value: XMPPService | null | undefined) => void
  raDataProvider: DataProvider | undefined
  setRaDataProvider: (value: DataProvider | undefined) => void
  mockPlayerId: MockId | null
  setMockPlayerId: (value: MockId | null) => void
  playerDetails: GamePlayerDetails | null
  getForce: (forceId: string) => Promise<ForceConfigType>
  getPlayerDetails: (userId: string) => Promise<UserConfigType | undefined>
  gameProperties: GamePropertiesType | null
  gameState: GameStateType | null
  nextTurn: (gameProperties: GamePropertiesType | null) => Promise<void> 
  rooms: RoomType[]
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

/** PubSub document schemas */
export interface ForceConfigType {
  type: 'force-config-type-v1'
  id: string // force id, taken from XMPP group id
  name: string // human-readable name
  objectives?: string // objectives for this force
  color?: string // color for this force
}

export interface UserConfigType {
  type: 'user-config-type-v1'
  name: string
  forceId?: string // value lost using transition between forces
}