import { XMPPRestService } from "../services/XMPPRestService"
import { XMPPService } from "../services/XMPPService"

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