import { useState, ReactNode, useMemo, useCallback } from 'react'
import { WargameContext } from './WargameContext'
import { XMPPService } from '../services/XMPPService'
import { DataProvider } from 'react-admin'
import { ForceConfigType, MockId } from '../types/wargame-d'
import { roomTypeFactory } from '../services/roomTypes'
import { mockBackend } from '../mockData/mockAdmin'
import { useGameProperties } from '../components/PlayerView/GameState/useGameSetup'
import { useGameState } from '../components/PlayerView/GameState/useGameState'

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
  const [forceCache] = useState<Record<string, ForceConfigType>>({})
  const { gameProperties } = useGameProperties(xmppClient)
  const { gameState, nextTurn } = useGameState(xmppClient)

  const getForce = useCallback(async (forceId: string): Promise<ForceConfigType> => {
    if (!forceId) {
      console.warn('force id missing', forceId)
    }
    // see if we have it cached
    const cached = forceCache[forceId]
    if (cached) {
      return cached
    }
    if (xmppClient === undefined) {
      throw new Error('Not connected')
    } else if (xmppClient === null) {
      // get the mock force data
      const rForce = mockBackend.groups.find(g => g.id === forceId)
      if (!rForce) {
        throw new Error('Force not found: ' + forceId)
      } else {
        const force: ForceConfigType = {
          type: 'force-config-type-v1',
          id: rForce.id,
          name: rForce.name,
          objectives: rForce.description,
          color: rForce.color
        }
        forceCache[forceId] = force
        return force
      }
    } else {
      const force = await xmppClient.getPubSubDocument('force:' + forceId)
      if (force) {
        forceCache[forceId] = force.content?.json as ForceConfigType
        return force.content?.json as ForceConfigType
      }
    }
    return forceCache[forceId]
  }, [xmppClient, forceCache])

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
    setMockPlayerId,
    roomTypeFactory,
    getForce,
    gameProperties,
    gameState,
    nextTurn
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
