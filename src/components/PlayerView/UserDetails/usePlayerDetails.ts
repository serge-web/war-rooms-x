import { useState, useEffect } from 'react'
import { useWargame } from '../../../contexts/WargameContext';
import { trimHost } from '../../AdminView/raHelpers';
import { useIndexedDBData } from '../../../hooks/useIndexedDBData';
import { RGroup, RUser } from '../../AdminView/raTypes-d';
import { ForceConfigType, UserConfigType } from '../../../types/wargame-d';

export interface GamePlayerDetails {
  id: string
  role: string
  forceId: string
  forceName: string
  forceObjectives?: string
  color?: string
}

export const usePlayerDetails = () => {
  const [playerDetails, setPlayerDetails] = useState<GamePlayerDetails | null>(null)
  const { xmppClient, mockPlayerId, setMockPlayerId } = useWargame()
  const { data: mockUsers, loading: usersLoading } = useIndexedDBData<RUser[]>('users')
  const { data: mockForces, loading: forcesLoading } = useIndexedDBData<RGroup[]>('groups')

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
        if (!usersLoading && !forcesLoading) {
          // do we have player id?
          if(mockPlayerId) {
            const player = mockUsers?.find(p => p.id === mockPlayerId.playerId)
            const force = mockForces?.find(f => f.id === mockPlayerId.forceId)
            // ok, use mock data
            setPlayerDetails({
              id: player?.id || 'unknown',
              role: player?.name || 'unknown',
              forceId: force?.id || 'unknown',
              forceName: force?.name || 'unknown',
              forceObjectives: force?.objectives || 'unknown',
              color: force?.color || 'unknown'
            })
          }
        }
      } else {
        // get the pubsub doc for this user
        const userId = 'users:' + trimHost(xmppClient.bareJid)
        const doc = await xmppClient.getPubSubDocument(userId)
        if (doc) {
          const userConfig = doc.content?.json as UserConfigType
          if (userConfig) {
            // set the initial player details
            setPlayerDetails({
              id: trimHost(xmppClient.bareJid),
              role: userConfig.name || 'unknown',
              forceId: '',
              forceName: '',
              forceObjectives: '',
              color: undefined
            })
            const forceId = userConfig.forceId
            if (forceId) {
              // get the force document
              const forceDoc = await xmppClient.getPubSubDocument('forces:' + forceId)
              if (forceDoc) {
                const forceConfig = forceDoc.content?.json as ForceConfigType
                if (forceConfig) {
                  setPlayerDetails({
                    id: trimHost(xmppClient.bareJid),
                    role: userConfig.name || 'unknown',
                    forceId: forceId,
                    forceName: forceConfig.name,
                    forceObjectives: forceConfig.objectives,
                    color: forceConfig.color
                  })
                }
              }
            }
          }
        }
      }
    }
    
    fetchPlayerDetails()
  }, [xmppClient, mockPlayerId, mockUsers, mockForces, usersLoading, forcesLoading]);

  return { playerDetails, setMockPlayerId, mockPlayerId }
}