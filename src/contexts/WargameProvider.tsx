import { useState, ReactNode, useMemo } from 'react'
import { WargameContext } from './WargameContext'
import { XMPPService } from '../services/XMPPService'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [xmppClient, setXmppClient] = useState<XMPPService | null | undefined>(undefined) 
  
  const loggedIn = useMemo(() => {
    return xmppClient !== undefined
  }, [xmppClient])

  const value = {
    loggedIn,
    xmppClient,
    setXmppClient
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
