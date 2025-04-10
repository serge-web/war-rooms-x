import { useState, ReactNode, useMemo } from 'react'
import { WargameContext } from './WargameContext'
import { RoomType } from '../types/rooms'
import { XMPPService } from '../rooms-api/xmpp/XMPPService'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [xmppClient, setXmppClient] = useState<XMPPService | null | undefined>(undefined) 
  
  const loggedIn = useMemo(() => {
    return xmppClient !== undefined
  }, [xmppClient])

  const value = {
    loggedIn,
    rooms,
    setRooms,
    xmppClient,
    setXmppClient
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
