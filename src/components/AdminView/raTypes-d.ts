import { RaRecord } from "react-admin"
import { GamePropertiesType, GameStateType } from "../../types/wargame-d"
import { GameMessage, RoomDetails, Template } from "../../types/rooms-d"
import { ThemeConfig } from "antd"

/**
 * Base interface for OpenFire records
 */
export interface XRecord {
  // This is a marker interface for OpenFire records
  readonly _type?: 'openfire-record'
}

/**
* Room/Channel representation from OpenFire
*/
export interface XRoom extends XRecord {
  roomName: string
  naturalName?: string
  description?: string
  subject?: string
  persistent?: boolean
  publicRoom?: boolean
  registrationEnabled?: boolean
  canAnyoneDiscoverJID?: boolean
  canOccupantsChangeSubject?: boolean
  canOccupantsInvite?: boolean
  canChangeNickname?: boolean
  logEnabled?: boolean
  loginRestrictedToNickname?: boolean
  membersOnly?: boolean
  moderated?: boolean
  broadcastPresenceRoles?: string[]
  owners?: string[]
  admins?: string[]
  members?: string[]
  memberGroups?: string[]
  outcasts?: string[]
  maxUsers?: number
  creationDate?: string
  modificationDate?: string
}

export interface RRoom extends RaRecord {
  id: string
  name: string
  details?: RoomDetails
  members?: string[]
  memberForces?: string[]
  owners?: string[]
  admins?: string[]
  public?: boolean // whether anyone can join - others are members only
  dummyMessages?: GameMessage[]
  dummyTheme?: ThemeConfig
}

/**
 * Group/Force representation from OpenFire
 */
export interface XGroup extends XRecord {
  name: string
  description?: string
  members?: string[]
}

export interface RGroup extends RaRecord {
  id: string
  name: string
  objectives?: string
  members?: string[]
  color?: string
}

/**
 * User representation from OpenFire
 */
export interface XUser extends XRecord {
  username: string // this is effectively the id
  name: string // this is the human-readable title
  properties?: Record<string, string>
}

export interface RUser extends RaRecord {
  id: string
  name: string
  properties?: Record<string, string>
}

/** utilty class that combines two subject documents */
export interface XGameState extends XRecord {
  gameProperties: GamePropertiesType
  gameState: GameStateType
}

export interface RGameState extends RaRecord, GamePropertiesType, GameStateType {
  id: string
}

export interface XTemplate extends XRecord, Template {
  id: string
}

export interface RTemplate extends RaRecord, Template {
  id: string
}