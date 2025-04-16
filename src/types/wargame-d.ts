import { XMPPRestService } from "../services/XMPPRestService"
import { XMPPService } from "../services/XMPPService"
import { PLAN_ADJUDICATE_TURNS, LINEAR_TURNS } from "../types/constants"

export interface GamePropertiesType {
  name: string
  description?: string
  startTime: string
  stepTime: string
  turnType: typeof PLAN_ADJUDICATE_TURNS | typeof LINEAR_TURNS
}

export interface GameStateType {
  turn: string
  currentTime: string
  currentPhase: string
}

export interface WargameContextType {
  loggedIn: boolean
  xmppClient: XMPPService | null | undefined
  setXmppClient: (value: XMPPService | null | undefined) => void
  restClient: XMPPRestService | null | undefined
  setRestClient: (value: XMPPRestService | null | undefined) => void
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