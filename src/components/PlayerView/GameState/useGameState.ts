import { useState, useEffect, useRef } from 'react'
import { mockGameState } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { GameStateType } from '../../../types/wargame';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const { xmppClient } = useWargame()
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const pending = useRef<boolean>(false)

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    const fetchGameState = async () => {
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
        // ok, use mock data
        setGameState(mockGameState)
      } else {

        if (xmppClient.pubsubService) {
          const results = await xmppClient.subscribeToPubSubDocument('game-state', (document) => {
            const state = document.content?.json
            if (state) {
              setGameState(state)
            }
          })
          if (!results.success) {
            if (results.error?.includes('Already subscribed')) {
              return
            }
          } else {
            if (results.subscriptionId) {
              setSubscriptionId(results.subscriptionId)
            }
          }        
          const state = await xmppClient.getPubSubDocument('game-state')
          if (state) {
            setGameState(state.content?.json as GameStateType)
          }
  
          if(!state) {
            console.error('Creating missing state document ', results)
            // // ok, create it
            // const stateMsg: JSONItem = {
            //   itemType: NS_JSON_0,
            //   json: mockGameState
            // }
            // // create the pubsub node for game state
            // const results2 = await xmppClient.createPubSubDocument('game-state', { 'pubsub#access_model': 'open', 'pubsub#node_type': 'leaf' }, stateMsg)
            // console.log('created pubsub node', results2)  
            // setGameState(mockGameState)
          }

        }
      }
    }
    console.log('pending', pending.current)
    if (!pending.current) {
      pending.current = true
      fetchGameState()
    }
  }, [xmppClient, xmppClient?.pubsubService]);

  if (!subscriptionId) {
    console.log(pending.current)
  }

  return { gameState };
}