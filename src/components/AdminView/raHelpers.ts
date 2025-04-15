import { RaRecord } from "react-admin"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XRecord } from "./raTypes-d"

// Define mapper functions for each resource type
const mapUserToRecord = (result: XUser): RUser => {
  return {
    id: result.username,
    name: result.name
  }
}

const mapRecordToUser = (result: RUser): XUser => {
  return {
    username: result.id as string,
    name: result.name
  }
}

const mapRoomToRecord = (result: XRoom): RRoom => {
  return {
    id: result.roomName,
    name: result.naturalName || 'pending',
    description: result.description,
    members: result.members,
    memberForces: result.memberGroups
  }
}

const mapRecordToRoom = (result: RRoom): XRoom => {
  return {
    roomName: result.id as string,
    naturalName: result.name,
    description: result.description,
    members: result.members,
    memberGroups: result.memberForces
  }
}

const mapGroupResultsToRecord = (result: XGroup): RGroup => {
  return {
    id: result.name,
    description: result.description,
    members: result.members
  }
}

const mapRecordToGroup = (result: RGroup): XGroup => {
  return {
    name: result.id as string,
    description: result.description
  }
}

const groupCreate = (result: XGroup): XGroup => {
  const addOns = {
    members: [],
    admins: [],
    shared: false
  }
  return {
    ...result,
    ...addOns
  }
}

type ResourceHandler<X extends XRecord, R extends RaRecord> = {
  resource: string
  toRRecord: (result: X) => R
  toXRecord: (result: R) => X
  forCreate?: (result: X) => X
}

const GroupMapper: ResourceHandler<XGroup, RGroup> = {
  resource: 'groups',
  toRRecord: mapGroupResultsToRecord,
  toXRecord: mapRecordToGroup,
  forCreate: groupCreate
}

const RoomMapper: ResourceHandler<XRoom, RRoom> = {
  resource: 'chatrooms',
  toRRecord: mapRoomToRecord,
  toXRecord: mapRecordToRoom
}

const UserMapper: ResourceHandler<XUser, RUser> = {
  resource: 'users',
  toRRecord: mapUserToRecord,
  toXRecord: mapRecordToUser
}

// Use a type that can represent any of our resource handlers
type AnyResourceHandler = 
  | ResourceHandler<XGroup, RGroup>
  | ResourceHandler<XRoom, RRoom>
  | ResourceHandler<XUser, RUser>

export const mappers: AnyResourceHandler[] = [
  GroupMapper,
  RoomMapper,
  UserMapper
]
