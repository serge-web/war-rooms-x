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
      // TODO: use real data
    }
  }, [xmppClient]);

  return { playerDetails };
}