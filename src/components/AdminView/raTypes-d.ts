import { RaRecord } from "react-admin"

/**
* Room/Channel representation from OpenFire
*/
export interface XRoom {
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
  description?: string
  members?: string[]
  memberForces?: string[]
}

/**
 * Group/Force representation from OpenFire
 */
export interface XGroup {
  name: string
  description?: string
  members?: string[]
}

export interface RGroup extends RaRecord {
  id: string
  description?: string
  members?: string[]
}

/**
 * User representation from OpenFire
 */
export interface XUser {
  username: string
  name?: string
  properties?: Record<string, string>
}

export interface RUser extends RaRecord {
  id: string
  name?: string
  properties?: Record<string, string>
}


  

// Define a union type for all possible resource data types
export type XResourceData = (XGroup | XUser | XRoom)
export type RResourceData = (RGroup | RUser | RRoom)