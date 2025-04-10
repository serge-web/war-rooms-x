import { useState, useEffect } from 'react'
import { mockForceData, mockUserDetails } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';

export interface GamePlayerDetails {
  id: string
  role: string
  forceName: string
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
          forceName: force.fullName,
          color: force.color
        })
      } else {
        // get the AccountInfo from the xmpp client
        const vCard = await xmppClient.getCurrentUserVCard()
        const bareJid = vCard.jid.split('/')[0]
        setPlayerDetails({
          id: vCard.role || bareJid,
          role: vCard.role || 'unknown',
          forceName: vCard.organization || 'unknown'
        })
        // const accountInfo = xmppClient.getAccountInfo()
        // console.log('AccountInfo:', accountInfo)
      }
    }
    
    fetchPlayerDetails()
  }, [xmppClient]);

  return { playerDetails };
}