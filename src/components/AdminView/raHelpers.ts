import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, RResourceData, XResourceData } from "./raTypes-d"

// Define mapper functions for each resource type
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


// Define our mappers with an index signature to allow string indexing
// Using type assertions to ensure type safety while allowing for resource-specific handling
export const toRMappers: { [key: string]: (result: unknown) => RResourceData } = {
  'groups': ((result: unknown) => mapGroupResultsToRecord(result as XGroup)) as (result: unknown) => RGroup,
  'users': ((result: unknown) => mapUserToRecord(result as XUser)) as (result: unknown) => RUser,
  'chatrooms': ((result: unknown) => mapRoomToRecord(result as XRoom)) as (result: unknown) => RRoom
}

export const toXMappers: { [key: string]: (result: unknown) => XResourceData } = {
  'groups': ((result: unknown) => mapRecordToGroup(result as RGroup)) as (result: unknown) => XGroup,
  'users': ((result: unknown) => mapRecordToUser(result as RUser)) as (result: unknown) => XUser,
  'chatrooms': ((result: unknown) => mapRecordToRoom(result as RRoom)) as (result: unknown) => XRoom
}