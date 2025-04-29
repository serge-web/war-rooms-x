import { useState, useCallback } from 'react'
import { ForceConfigType } from '../types/wargame-d'
import { RGroup } from '../components/AdminView/raTypes-d'
import { useIndexedDBData } from './useIndexedDBData'
import { JSONItem } from 'stanza/protocol'
import { XMPPService } from '../services/XMPPService'

export const useForces = () => {
  const [forces, setForces] = useState<ForceConfigType[]>([])
  const { data: mockForces, loading: forcesLoading } = useIndexedDBData<RGroup[]>('groups')

  const getForce = useCallback(async (forceId: string, xmppClient: XMPPService | null | undefined): Promise<ForceConfigType | undefined> => {
    if (xmppClient === undefined) {
      return undefined
    } else if (xmppClient === null ) {
        // check fofr local cached force
        const force = forces.find(f => f.id === forceId)
        if (force) {
          return force
        } 
        // retrieve mock data
        if (!forcesLoading) {
          const force = mockForces?.find(force => force.id === forceId)
          if (force) {
            const res: ForceConfigType = {
              type: 'force-config-type-v1',
              id: force.id,
              name: force.name,
              objectives: force.objectives,
              color: force.color
            }
            setForces([...forces, res])
            return res
          }
      }
    } else {
      // do we have  cached value?
      const force = forces.find(f => f.id === forceId)
      console.log('force pubsub cached', forceId,  force)
      if (force) {
        return force
      }
      // get the pubsub doc for this force
      const forceDoc = await xmppClient.getPubSubDocument('forces:' + forceId)
      console.log('force pubsub retrieved', forceId,  forceDoc)
      if (forceDoc) {
        const jsonItem = forceDoc.content?.json as JSONItem
        const forceConfig = jsonItem?.json as ForceConfigType
        if (forceConfig) {
          setForces([...forces, forceConfig])
          return forceConfig
        }
      }
    }
  }, [mockForces, forces, forcesLoading])

  return { getForce }
}