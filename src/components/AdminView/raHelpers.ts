import { DataProvider, RaRecord } from "react-admin"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XRecord, RGameState, XGameState, XTemplate } from "./raTypes-d"
import { XMPPService } from "../../services/XMPPService"
import { ForceConfigType, UserConfigType } from "../../types/wargame-d"
import { PubSubDocument } from "../../services/types"
import WargameDataProvider from "./wargameDataProvider"
import { Template } from "../../types/rooms-d"
import TemplateDataProvider from "./templateDataProvider"

// Static method to ensure members have proper host format
export const formatMemberWithHost = (member: string): string => {
  // TODO: remove hard-coded host name
  if(member.includes('@')) {
    return member
  }
  return `${member}@ubuntu-linux-2404`
}

export const trimHost = (member: string): string => {
  if(member.includes('@')) {
    return member.split('@')[0]
  }
  return member
}

// Define mapper functions for each resource type
export const userXtoR = async (result: XUser, id?: string, xmppClient?: XMPPService): Promise<RUser> => {
  // look for user pubsub doc
  const doc = await xmppClient?.getPubSubDocument('users:' + id)
  if (doc) {
    const userConfig = doc.content?.json as UserConfigType
    const res : RUser = {
      id: id || result.username,
      name: userConfig.name
    }
    return res
  }
  return {
    id: id || result.username,
    name: result.name
  }
}

const userRtoX = async (result: RUser, id: string, xmppClient: XMPPService): Promise<XUser> => {
  // handle the pubsub document
  const newDoc: UserConfigType = {
    type: 'user-config-type-v1',
    name: result.name
  }
  const nodeId = 'users:' + id
  // check if this node exists
  if (!await xmppClient.checkPubSubNodeExists(nodeId)) {
    // create the node
    const res = await xmppClient.publishPubSubLeaf(nodeId, 'users', newDoc)
    if (!res) {
      console.error('problem creating user document', res)
    }
  } else {
    const existingUserNode = await xmppClient.getPubSubDocument(nodeId)
    const existingUserConfig = existingUserNode?.content?.json as UserConfigType
    if (existingUserConfig) {
      const mergedNode = {
        ...existingUserConfig,
        name: result.name,
        type: existingUserConfig.type
      }
      const res = await xmppClient.publishPubSubLeaf(nodeId, 'users', mergedNode)
      if (!res.success) {
        console.error('problem publishing document', id)
      } 
    }
  }
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
    members: result.members?.map(trimHost) || [],
    memberForces: result.memberGroups,
    owners: result.owners?.map(trimHost) || [],
    admins: result.admins?.map(trimHost) || []
  }
}

const roomRtoX = (result: RRoom): XRoom => {
  return {
    roomName: result.id as string,
    naturalName: result.name,
    description: result.description,
    members: result.members?.map(formatMemberWithHost) || [],
    memberGroups: result.memberForces,
    persistent: true,
    publicRoom: result.public
  }
}


/**
 * Convert an XMPP Group to a React Admin Group
 * @param result The XMPP Group to convert
 * @param _id 
 * @param xmppClient 
 * @param verbose whether to pull in the PubSub config data
 * @returns 
 */
const groupXtoR = async (result: XGroup, _id: string | undefined, xmppClient: XMPPService, verbose: boolean): Promise<RGroup> => {
  // if a member is lacking the host, append it
  const members = result.members || []
  // ok, we have to get the pubsub document for this force
  const doc = verbose && (await xmppClient?.getPubSubDocument('forces:' + result.name)) as PubSubDocument
  const forceConfig = (verbose && doc) ? doc?.content?.json as ForceConfigType : undefined
  const res: RGroup = {
    id: result.name,
    name: forceConfig?.name || result.name,
    objectives: forceConfig?.objectives || undefined,
    members: members.map(formatMemberWithHost),
    color: forceConfig?.color || undefined
  }
  return res
}

const groupRtoX = async (result: RGroup, id: string, xmppClient: XMPPService, previousData?: RGroup): Promise<XGroup> => {
  // handle the pubsub document
  const newDoc: ForceConfigType = {
    type: 'force-config-type-v1',
    id: id,
    name: result.name,
    color: result.color,
    objectives: result.objectives
  }
  const nodeId = 'forces:' + id
  const res = await xmppClient?.publishPubSubLeaf(nodeId, 'forces', newDoc)
  if (!res.success) {
    console.error('problem publishing document', id)
  }
  // note: we also need to update player vCards - to indicate which force they are in
  // first, check if the list of members has changed.
  const members = result.members || []
  const previousMembers = previousData?.members || []
  // check for removed members
  const removedMembers = previousMembers.filter(member => !members.includes(member))
  const removePromises = removedMembers.map(member => {
    return xmppClient.updateUserForceId(trimHost(member), undefined)
  })
  await Promise.all(removePromises)
  // check for added members
  const addedMembers = members.filter(member => !previousMembers.includes(member))
  const addPromises = addedMembers.map(member => {
    return xmppClient.updateUserForceId(trimHost(member), id)
  })
  await Promise.all(addPromises)
  // clear the vCard organisation for removed members
  return {
    name: id,
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
  toRRecord?: (result: X, id: string | undefined, xmppClient: XMPPService, verbose: boolean) => R | Promise<R>
  toXRecord?: (result: R, id: string, xmppClient: XMPPService, previousData?: R) => X | Promise<X>
  forCreate?: (result: X) => X
  modifyId?: (id: string) => string
  provider?: (xmppClient: XMPPService) => DataProvider
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

const WargameMapper: ResourceHandler<XGameState, RGameState> = {
  resource: 'wargames',
  provider: (xmppClient: XMPPService) => WargameDataProvider(xmppClient)
}

const TemplateMapper: ResourceHandler<XTemplate, Template> = {
  resource: 'templates',
  provider: (xmppClient: XMPPService) => TemplateDataProvider(xmppClient)
}

// Use a type that can represent any of our resource handlers
export type AnyResourceHandler = 
  | ResourceHandler<XGroup, RGroup>
  | ResourceHandler<XRoom, RRoom>
  | ResourceHandler<XUser, RUser>
  | ResourceHandler<XGameState, RGameState>
  | ResourceHandler<XTemplate, Template>

export const mappers: AnyResourceHandler[] = [
  GroupMapper,
  RoomMapper,
  UserMapper,
  WargameMapper,
  TemplateMapper
]
