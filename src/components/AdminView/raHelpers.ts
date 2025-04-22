import { RaRecord } from "react-admin"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XRecord } from "./raTypes-d"
import { XMPPService } from "../../services/XMPPService"
import { ForceConfigType } from "../../types/wargame-d"
import { PubSubDocument, PubSubOptions } from "../../services/types"
import { DataForm, JSONItem } from "stanza/protocol"
import { NS_JSON_0 } from "stanza/Namespaces"

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
export const userXtoR = (result: XUser, id?: string): RUser => {
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
    memberGroups: result.memberForces
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
  console.log(verbose ? 'about to get doc' : 'not getting doc', result.name, _id)
  const doc = verbose && (await xmppClient?.getPubSubDocument('force-' + result.name)) as PubSubDocument
  console.log('doc', doc)
  const forceConfig = (verbose && doc) ? doc?.content?.json as ForceConfigType : undefined
  return {
    id: result.name,
    name: forceConfig?.name || result.name,
    objectives: forceConfig?.objectives || undefined,
    members: members.map(formatMemberWithHost),
    color: forceConfig?.color || undefined
  }
}

const groupRtoX = async (result: RGroup, id: string, xmppClient: XMPPService): Promise<XGroup> => {
  // handle the pubsub document
  const doc = await xmppClient?.getPubSubDocument('force-' + id)
  const newDoc: ForceConfigType = {
    id: id,
    name: result.name,
    color: result.color,
    objectives: result.objectives
  }
  const jsonDoc: JSONItem = {
    itemType: NS_JSON_0,
    json: newDoc
  }
  if (doc) {
    const res = await xmppClient?.publishJsonToPubSubNode('force-' + id, jsonDoc)
    if (!res.success) {
      console.error('problem publishing document', id)
    }
  } else {
    // check for the collection
    const forces = await xmppClient.checkPubSubNodeExists('forces')
    if (!forces) {
      const collectionForm: DataForm = {
        type: 'submit',
        fields: [
          { name: 'FORM_TYPE', type: 'hidden', value: 'http://jabber.org/protocol/pubsub#node_config' },
          { name: 'pubsub#node_type', value: 'collection' },
          { name: 'pubsub#access_model', value: 'open' }
        ]
      };

      const res = await xmppClient.createPubSubDocument('forces', collectionForm as PubSubOptions)
      if (!res || !res.id) {
        console.error('problem creating forces collection', res)
      }
    }
    // create the document
    const leafForm: DataForm = {
      type: 'submit',
      fields: [
        { name: 'FORM_TYPE', type: 'hidden', value: 'http://jabber.org/protocol/pubsub#node_config' },
        { name: 'pubsub#node_type', value: 'leaf' },
        { name: 'pubsub#access_model', value: 'open' },
        { name: 'pubsub#collection', value: 'forces' }
      ]
    };

    const res = await xmppClient?.createPubSubDocument('force-' + id, leafForm as PubSubOptions, jsonDoc)
    if (!res || !res.success) {
      console.error('problem creating force document', res)
    }
  }
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
  toRRecord: (result: X, id: string | undefined, xmppClient: XMPPService, verbose: boolean) => R | Promise<R>
  toXRecord: (result: R, id: string, xmppClient: XMPPService) => X | Promise<X>
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
