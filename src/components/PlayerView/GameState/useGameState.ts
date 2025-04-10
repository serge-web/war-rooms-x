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
          const getResults = await xmppClient.getPubSubDocument('game-state')
          if (getResults !== null) {
            const state = getResults.content?.json
            if (state) {
              setGameState(state)
            }
          }
          else {
            // ok, create it
            const stateMsg: JSONItem = {
              itemType: NS_JSON_0,
              json: mockGameState
            }
            // create the pubsub node for game state
            const results = await xmppClient.createPubSubDocument('game-state', { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, stateMsg)
            console.log('created pubsub node', results)
          }
        }
      }
    }
    
    fetchGameState()
  }, [xmppClient, xmppClient?.pubsubService]);

  return { gameState };
}