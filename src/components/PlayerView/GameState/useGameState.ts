import { useState, useEffect } from 'react'
import { mockGameState } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { GameStateType } from '../../../types/wargame';
import { JSONItem } from 'stanza/protocol';
import { NS_JSON_0 } from 'stanza/Namespaces';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const { xmppClient } = useWargame()

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    const fetchGameState = async () => {
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
        // ok, use mock data
        setGameState(mockGameState)
      } else {
        // TODO: use real data
        if (xmppClient.pubsubService) {
          console.log('about to subscribe to pubsub document')
          const state = await xmppClient.getPubSubDocument('game-state')
          if (state) {
            setGameState(state.content?.json as GameStateType)
          }
          const results = await xmppClient.subscribeToPubSubDocument('game-state', (document) => {
            console.log('received pubsub document')
            const state = document.content?.json
            if (state) {
              setGameState(state)
            }
          })
          if (!results.success) {
            console.error('Failed to subscribe to pubsub document: ', results)
            // ok, create it
            const stateMsg: JSONItem = {
              itemType: NS_JSON_0,
              json: mockGameState
            }
            // create the pubsub node for game state
            const results2 = await xmppClient.createPubSubDocument('game-state', { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, stateMsg)
            console.log('created pubsub node', results2)
          }
        }
      }
    }
    
    fetchGameState()
  }, [xmppClient, xmppClient?.pubsubService]);

  return { gameState };
}