import { useState, useEffect, useCallback } from 'react'
import { mockGameState } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { GameStateType } from '../../../types/wargame';
import { PubSubDocumentChangeHandler } from '../../../services/types';
import { incrementState } from './incrementState';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const { xmppClient } = useWargame()
  
  const nextTurn = useCallback(async () => {
    if (gameState && xmppClient?.pubsubService) {
      const newState = incrementState(gameState)
      const res = await xmppClient.updatePubSubDocument('game-state', newState)
      if (!res.success) {
        console.error('Failed to update game state', res)
      }
    }
  }, [gameState, xmppClient])

  useEffect(() => {
    if (!xmppClient) {
      return
    }
      if (xmppClient === undefined) {
        // waiting for login
      } else if (xmppClient === null) {
          // ok, use mock data
          setGameState(mockGameState)
      } else {
        const docHandler: PubSubDocumentChangeHandler = (document) => {
          console.log('PubSub document changed', document)
          const state = document.content?.json
          if (state) {
            setGameState(state)
          }
        }
        const subAndGet = async () => {
          if (xmppClient.pubsubService) {
            const results = await xmppClient.subscribeToPubSubDocument('game-state', docHandler)
            if (!results.success) {
              if (results.error?.includes('Already subscribed')) {
                console.log('Already subscribed to PubSub document')
              }
            }
          }  
          const state = await xmppClient.getPubSubDocument('game-state')
          if (state) {
            setGameState(state.content?.json as GameStateType)
          }
        }
        subAndGet()
      }
  }, [xmppClient]);

  return { gameState, nextTurn };
}