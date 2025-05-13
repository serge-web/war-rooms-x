import { RGroup, XGroup } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { ForceConfigType } from '../../../types/wargame-d'
import { FORCES_COLLECTION, FORCES_PREFIX } from '../../../types/constants'
import { ResourceHandler, trimHost, formatMemberWithHost } from './types'

/**
 * Convert an XMPP Group to a React Admin Group
 * @param result The XMPP Group to convert
 * @param _id 
 * @param xmppClient 
 * @param verbose whether to pull in the PubSub config data
 * @returns 
 */
export const groupXtoR = async (result: XGroup, _id: string | undefined, xmppClient: XMPPService, verbose: boolean): Promise<RGroup> => {
  // if a member is lacking the host, append it
  const members = result.members || []
  // ok, we have to get the pubsub document for this force
  const doc = verbose && (await xmppClient?.getPubSubDocument(FORCES_PREFIX + result.name)) as ForceConfigType
  const forceConfig = (verbose && doc) ? doc : undefined
  const res: RGroup = {
    id: result.name,
    name: forceConfig?.name || result.name,
    objectives: forceConfig?.objectives || undefined,
    members: members.map(formatMemberWithHost),
    color: forceConfig?.color || undefined
  }
  return res
}

export const groupRtoX = async (result: RGroup, id: string, xmppClient: XMPPService, previousData?: RGroup): Promise<XGroup> => {
  // handle the pubsub document
  const newDoc: ForceConfigType = {
    type: 'force-config-type-v1',
    id: id,
    name: result.name,
    color: result.color,
    objectives: result.objectives
  }
  const nodeId = FORCES_PREFIX + id
  const res = await xmppClient?.publishPubSubLeaf(nodeId, FORCES_COLLECTION, newDoc as unknown as Record<string, unknown>)
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

export const groupCreate = (result: XGroup): XGroup => {
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

export const GroupMapper: ResourceHandler<XGroup, RGroup> = {
  resource: 'groups',
  toRRecord: groupXtoR,
  toXRecord: groupRtoX,
  forCreate: groupCreate
}
