import { RUser, XUser } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { UserConfigType } from '../../../types/wargame-d'
import { USERS_COLLECTION, USERS_PREFIX } from '../../../types/constants'
import { ResourceHandler, trimHost } from './types'

export const userXtoR = async (result: XUser, id?: string, xmppClient?: XMPPService): Promise<RUser> => {
  const idToUse = id || result.username
  // strip suffix, if present
  const idToUseStripped = trimHost(idToUse)
  // look for user pubsub doc
  const doc = await xmppClient?.getPubSubDocument(USERS_PREFIX + idToUseStripped)
  if (doc) {
    const userConfig = doc as UserConfigType
    const res: RUser = {
      id: idToUse,
      name: userConfig.name
    }
    return res
  }
  return {
    id: idToUse,
    name: result.name
  }
}

export const userRtoX = async (result: RUser, id: string, xmppClient: XMPPService): Promise<XUser> => {
  // handle the pubsub document
  const newDoc: UserConfigType = {
    type: 'user-config-type-v1',
    name: result.name
  }
  const nodeId = USERS_PREFIX + id
  // check if this node exists
  if (!await xmppClient.checkPubSubNodeExists(nodeId)) {
    // create the node
    const res = await xmppClient.publishPubSubLeaf(nodeId, USERS_COLLECTION, newDoc)
    if (!res) {
      console.error('problem creating user document', res)
    }
  } else {
    const existingUserNode = await xmppClient.getPubSubDocument(nodeId)
    const existingUserConfig = existingUserNode as UserConfigType
    if (existingUserConfig) {
      const mergedNode = {
        ...existingUserConfig,
        name: result.name,
        type: existingUserConfig.type
      }
      const res = await xmppClient.publishPubSubLeaf(nodeId, USERS_COLLECTION, mergedNode)
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

export const userCreate = (result: XUser): XUser => {
  const addOns = {
    email: 'pending@example.com',
    password: 'pwd'
  }
  return {
    ...result,
    ...addOns
  }
}

export const UserMapper: ResourceHandler<XUser, RUser> = {
  resource: 'users',
  toRRecord: userXtoR,
  toXRecord: userRtoX,
  forCreate: userCreate,
  modifyId: (id) => { return typeof id === 'string' ? id.split('@')[0] : id }
}
