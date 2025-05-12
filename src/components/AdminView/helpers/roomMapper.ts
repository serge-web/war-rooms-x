import { RRoom, XRoom } from '../raTypes-d'
import { ResourceHandler, formatMemberWithHost, isJson, trimHost } from './types'

export const roomXtoR = (result: XRoom): RRoom => {
  const desc = result.description
  const details = desc && isJson(desc) ? JSON.parse(desc) : undefined
  return {
    id: result.roomName,
    name: result.naturalName || 'pending',
    details: details,
    members: result.members?.map(trimHost) || [],
    memberForces: result.memberGroups,
    owners: result.owners?.map(trimHost) || [],
    admins: result.admins?.map(trimHost) || []
  }
}

export const roomRtoX = (result: RRoom): XRoom => {
  const details = result.details as unknown as string
  const description = details && !isJson(details) ? JSON.stringify(result.details) : undefined
  const res = {
    roomName: result.id as string,
    naturalName: result.name,
    description: description,
    members: result.members?.map(formatMemberWithHost) || [],
    memberGroups: result.memberForces,
    persistent: true,
    publicRoom: result.public,
    broadcastPresenceRoles: ['owner', 'admin', 'member']
  }
  return res
}

export const RoomMapper: ResourceHandler<XRoom, RRoom> = {
  resource: 'chatrooms',
  toRRecord: roomXtoR,
  toXRecord: roomRtoX
}
