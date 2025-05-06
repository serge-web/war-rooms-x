import { useCallback, useEffect, useState } from 'react'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { incrementState } from './incrementState'
import { usePubSub } from '../../../hooks/usePubSub'
import { useIndexedDBData } from '../../../hooks/useIndexedDBData'
import { RGameState } from '../../AdminView/raTypes-d'
import { splitGameState, mergeGameState } from '../../../helpers/split-game-state'
import localforage from 'localforage'
import { prefixKey } from '../../../types/constants'
import { XMPPService } from '../../../services/XMPPService'

export const  useGameState = (xmppClient: XMPPService | null | undefined) => {
  const { document: gameStatePub, updateDocument } = usePubSub<GameStateType>('game-state', xmppClient)
  const { data: mockWargame, loading } = useIndexedDBData<RGameState[]>('wargames')
  
  const [gameState, setGameState] = useState<GameStateType | null>(null)

  // If XMPP client is null (not undefined), use mock data
  useEffect(() => {
    if(xmppClient === undefined) {
      // don't bother
    } else if (xmppClient === null) {
      if (!loading && mockWargame) {
        const state =  mockWargame[0]
        const { gameState } = splitGameState(state)
        // split the state into two parts
        setGameState(gameState)
      }
    } else {
      setGameState(gameStatePub)
    }
  }, [xmppClient, mockWargame, loading, gameStatePub])

  const nextTurn = useCallback(async (gameProperties: GamePropertiesType | null) => {
    if (gameState && gameProperties) {
      const newState = incrementState(gameState, gameProperties)
      if (xmppClient === undefined) {
        // do nothing
      } else if (xmppClient === null) {
        // update the game state in the ra-data-local-forage
        // retrieve the first item in the wargames array
        const wargame = mockWargame?.[0]
        if (wargame) {
          const combinedState = mergeGameState(gameProperties, newState)
          // save the game object back to indexed db
          localforage.setItem(`${prefixKey}wargames`, [combinedState])
          setGameState(newState)
        }
      } else {
        const res = await updateDocument(newState)
        if (!res.success) {
          console.error('Failed to update game state', res)
        }
        setGameState(newState)
      }
    }
  }, [gameState, updateDocument, mockWargame, xmppClient])

  return { gameState: gameState, nextTurn }
}