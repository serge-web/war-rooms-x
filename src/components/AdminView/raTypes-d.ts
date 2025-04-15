import { RaRecord } from 'react-admin'

/**
* Room/Channel representation from OpenFire
*/
export interface xRoom {
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

/**
 * Group/Force representation from OpenFire
 */
export interface xGroup {
  name: string
  description?: string
  members?: string[]
}

export interface rGroup extends RaRecord {
  id: string
  description?: string
  members?: string[]
}

/**
 * User representation from OpenFire
 */
export interface xUser {
  username: string
  name?: string
  email?: string
  properties?: Record<string, string>
}


