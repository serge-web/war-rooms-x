import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, RResourceData, XResourceData } from "./raTypes-d"

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

type ResourceHandler = {
  resource: string
  toRRecord: (result: XResourceData) => RResourceData
  toXRecord: (result: RResourceData) => XResourceData
  forCreate?: (result: XResourceData) => XResourceData
}

export const mappers: ResourceHandler[] = [
  { resource: 'groups', toRRecord: mapGroupResultsToRecord, toXRecord: mapRecordToGroup }
]

// Define our mappers with an index signature to allow string indexing
// Using type assertions to ensure type safety while allowing for resource-specific handling
export const toRMappers: { [key: string]: (result: XResourceData) => RResourceData } = {
  'groups': ((result: XResourceData) => mapGroupResultsToRecord(result as XGroup)) as (result: unknown) => RGroup,
  'users': ((result: XResourceData) => mapUserToRecord(result as XUser)) as (result: unknown) => RUser,
  'chatrooms': ((result: XResourceData) => mapRoomToRecord(result as XRoom)) as (result: unknown) => RRoom
}

export const toXMappers: { [key: string]: (result: RResourceData) => XResourceData } = {
  'groups': ((result: unknown) => mapRecordToGroup(result as RGroup)) as (result: unknown) => XGroup,
  'users': ((result: unknown) => mapRecordToUser(result as RUser)) as (result: unknown) => XUser,
  'chatrooms': ((result: unknown) => mapRecordToRoom(result as RRoom)) as (result: unknown) => XRoom
}