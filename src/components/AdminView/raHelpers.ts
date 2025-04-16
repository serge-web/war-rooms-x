import { RaRecord } from "react-admin"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XRecord } from "./raTypes-d"

// Define mapper functions for each resource type
const userXtoR = (result: XUser, id?: string): RUser => {
  return {
    id: id || result.username,
    name: result.name
  }
}

const userRtoX = (result: RUser): XUser => {
  return {
    username: result.id as string,
    name: result.name
  }
}

const roomXtoR = (result: XRoom): RRoom => {
  return {
    id: result.roomName,
    name: result.naturalName || 'pending',
    description: result.description,
    members: result.members,
    memberForces: result.memberGroups
  }
}

const roomRtoX = (result: RRoom): XRoom => {
  return {
    roomName: result.id as string,
    naturalName: result.name,
    description: result.description,
    members: result.members,
    memberGroups: result.memberForces
  }
}

const groupXtoR = (result: XGroup): RGroup => {
  // if a member is lacking the host, append it
  const members = result.members || []
  // TODO: remove hard-coded host name
  const tidyMembers = members.map((m: string) => {
    if(m.includes('@')) {
      return m
    }
    return `${m}@ubuntu-linux-2404`
  })
  console.log('tidy members', result, tidyMembers)
  return {
    id: result.name,
    description: result.description,
    members: tidyMembers
  }
}

const groupRtoX = (result: RGroup): XGroup => {
  return {
    name: result.id as string,
    description: result.description,
    members: result.members
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

const userCreate = (result: XUser): XUser => {
  const addOns = {
    email: 'pending@example.com',
    password: 'pwd'
  }
  return {
    ...result,
    ...addOns
  }
}

type ResourceHandler<X extends XRecord, R extends RaRecord> = {
  resource: string
  toRRecord: (result: X, id?: string) => R
  toXRecord: (result: R) => X
  forCreate?: (result: X) => X
  modifyId?: (id: string) => string
}

const GroupMapper: ResourceHandler<XGroup, RGroup> = {
  resource: 'groups',
  toRRecord: groupXtoR,
  toXRecord: groupRtoX,
  forCreate: groupCreate
}

const RoomMapper: ResourceHandler<XRoom, RRoom> = {
  resource: 'chatrooms',
  toRRecord: roomXtoR,
  toXRecord: roomRtoX
}

const UserMapper: ResourceHandler<XUser, RUser> = {
  resource: 'users',
  toRRecord: userXtoR,
  toXRecord: userRtoX,
  forCreate: userCreate,
  modifyId: (id) => { return typeof id === 'string' ? id.split('@')[0] : id }
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
