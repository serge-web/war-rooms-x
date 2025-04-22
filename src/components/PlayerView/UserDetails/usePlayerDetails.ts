import { useState, useEffect } from 'react'
import { mockForceData, mockUserDetails } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { ForceConfigType, UserConfigType } from '../../../types/wargame-d';
import { trimHost } from '../../AdminView/raHelpers';

export interface GamePlayerDetails {
  id: string
  role: string
  forceName: string
  forceObjectives?: string
  color?: string
}

export const usePlayerDetails = () => {
  const [playerDetails, setPlayerDetails] = useState<GamePlayerDetails | null>(null)
  const { xmppClient } = useWargame()

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
        const player = mockUserDetails
        const force = mockForceData
        // ok, use mock data
        setPlayerDetails({
          id: player.name || 'unknown',
          role: player.username,
          forceName: force.name,
          forceObjectives: force.objectives,
          color: force.color
        })
      } else {
        // get the pubsub doc for this user
        const doc = await xmppClient.getPubSubDocument('users:' + trimHost(xmppClient.bareJid))
        if (doc) {
          const userConfig = doc.content?.json as UserConfigType
          if (userConfig) {
            const force = userConfig.forceId
            if (force) {
              // get the force document
              const forceDoc = await xmppClient.getPubSubDocument('forces:' + force)
              if (forceDoc) {
                const forceConfig = forceDoc.content?.json as ForceConfigType
                if (forceConfig) {
                  setPlayerDetails({
                    id: trimHost(xmppClient.bareJid),
                    role: userConfig.name || 'unknown',
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
  }, [xmppClient]);

  return { playerDetails }
}