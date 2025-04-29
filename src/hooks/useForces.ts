import { useState, useCallback } from 'react'
import { ForceConfigType } from '../types/wargame-d'
import { RGroup } from '../components/AdminView/raTypes-d'
import { useWargame } from '../contexts/WargameContext'
import { useIndexedDBData } from './useIndexedDBData'
import { JSONItem } from 'stanza/protocol'

export const useForces = () => {
  const [forces, setForces] = useState<ForceConfigType[]>([])
  const { xmppClient } = useWargame()
  const { data: mockForces, loading: forcesLoading } = useIndexedDBData<RGroup[]>('groups')

  const getForce = useCallback(async (forceId: string): Promise<ForceConfigType | undefined> => {
    if (xmppClient === undefined) {
      // ignore
    } else if (xmppClient === null ) {
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
          return res
        }
      }
    } else {
      // do we have  cached value?
      const force = forces.find(f => f.id === forceId)
      if (force) {
        return force
      }
      // get the pubsub doc for this force
      const forceDoc = await xmppClient.getPubSubDocument('forces:' + forceId)
      if (forceDoc) {
        const jsonItem = forceDoc.content?.json as JSONItem
        const forceConfig = jsonItem?.json as ForceConfigType
        if (forceConfig) {
          setForces([...forces, forceConfig])
          return forceConfig
        }
      }
    }
  }, [mockForces, xmppClient, forces, forcesLoading])

  return { getForce }
}