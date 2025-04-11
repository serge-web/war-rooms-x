import { useState, useEffect } from 'react'
import { mockGameState } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { GameStateType } from '../../../types/wargame';
import { PubSubDocumentChangeHandler } from '../../../services/types';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const { xmppClient } = useWargame()
  
  useEffect(() => {
    if (!xmppClient) {
      return
    }
    const docHandler: PubSubDocumentChangeHandler = (document) => {
      const state = document.content?.json
      if (state) {
        setGameState(state)
      }
    }
    const fetchGameState = async (docHandler: PubSubDocumentChangeHandler) => {
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
          // ok, use mock data
          setGameState(mockGameState)
        } else {
    
          if (xmppClient.pubsubService) {
            const results = await xmppClient.subscribeToPubSubDocument('game-state', docHandler)
            if (!results.success) {
              if (results.error?.includes('Already subscribed')) {
                return
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
      // const doUnsub = async() => {
      //   console.log('about to unsubscribe', !!docHandler)
      //   await xmppClient?.unsubscribeFromPubSubDocument('game-state', docHandler)
      // }
    
      fetchGameState(docHandler)

      // return () => {
      //   doUnsub()
      // }
  }, [xmppClient]);

  return { gameState };
}