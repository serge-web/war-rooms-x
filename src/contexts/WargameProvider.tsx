import { useState, ReactNode, useMemo } from 'react'
import { WargameContext } from './WargameContext'
import { XMPPService } from '../services/XMPPService'
import { DataProvider } from 'react-admin'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [xmppClient, setXmppClient] = useState<XMPPService | null | undefined>(undefined) 
  const [raDataProvider, setRaDataProvider] = useState<DataProvider | undefined>(undefined)
  const loggedIn = useMemo(() => {
    return xmppClient !== undefined
  }, [xmppClient])

  const setXMPPClientWrapper = (client: XMPPService | null | undefined) => {
    if (client === null || client === undefined) {
      setXmppClient(client)
      return
    }
    // check client has initialised
    const checkPubSub = () => {
      // console.log('checking pubsub)
      if (client && client.pubsubService) {
        // now clear my subscriptions
        client.clearPubSubSubscriptions().then(() => {
          setXmppClient(client)
        })
      } else {
        setTimeout(checkPubSub, 100) // Check again after 100ms
      }
    }
    checkPubSub()    
  }

  const value = {
    loggedIn,
    xmppClient,
    setXmppClient: setXMPPClientWrapper,
    raDataProvider,
    setRaDataProvider
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
