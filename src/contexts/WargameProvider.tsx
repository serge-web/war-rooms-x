import { useState, ReactNode, useMemo } from 'react'
import { WargameContext } from './WargameContext'
import { XMPPService } from '../services/XMPPService'
import { DataProvider } from 'react-admin'
import { MockId } from '../types/wargame-d'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  // for this object, `null` is a special value meaning `use mock data`
  const [xmppClient, setXmppClient] = useState<XMPPService | null | undefined>(undefined) 
  const [raDataProvider, setRaDataProvider] = useState<DataProvider | undefined>(undefined)
  const [mockPlayerId, setMockPlayerId] = useState<MockId | null>(null)
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
    setRaDataProvider,
    mockPlayerId,
    setMockPlayerId
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
