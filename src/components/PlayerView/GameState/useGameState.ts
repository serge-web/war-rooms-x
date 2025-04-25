import { useCallback, useMemo } from 'react'
import { useWargame } from '../../../contexts/WargameContext'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { incrementState } from './incrementState'
import { usePubSub } from '../../../hooks/usePubSub'
import { useIndexedDBData } from '../../../hooks/useIndexedDBData'
import { RGameState } from '../../AdminView/raTypes-d'
import { splitGameState, mergeGameState } from '../../../helpers/split-game-state'
import localforage from 'localforage'
import { prefixKey } from '../../../types/constants'

export const useGameState = () => {
  const { xmppClient } = useWargame()
  const { document: gameState, updateDocument } = usePubSub<GameStateType>('game-state')
  const { document: gameProperties } = usePubSub<GamePropertiesType>('game-setup')
  const { data: mockWargame, loading } = useIndexedDBData<RGameState[]>('wargames')
  
  // If XMPP client is null (not undefined), use mock data
  const effectiveGameState = useMemo(() => {
    if(xmppClient === undefined) {
      // don't bother
    } else if (xmppClient === null) {
      if (!loading && mockWargame) {
        const state =  mockWargame[0]
        const { gameState } = splitGameState(state)
        // split the state into two parts
        return gameState
      }
    } else {
      return gameState
    }
  }, [xmppClient, mockWargame, loading, gameState])
  
  const effectiveGameProperties = useMemo(() => {
    if(xmppClient === undefined) {
      // don't bother
    } else if (xmppClient === null) {
      if (!loading && mockWargame) {
        const state =  mockWargame[0]
        const { gameProperties } = splitGameState(state)
        // split the state into two parts
        return gameProperties
      }
    } else {
      return gameProperties
    }
  }, [xmppClient, mockWargame, loading, gameProperties])
  

  const nextTurn = useCallback(async () => {
    if (effectiveGameState && effectiveGameProperties) {
      const newState = incrementState(effectiveGameState, effectiveGameProperties)
      if (xmppClient === undefined) {
        // do nothing
      } else if (xmppClient === null) {
        // update the game state in the ra-data-local-forage
        // retrieve the first item in the wargames array
        const wargame = mockWargame?.[0]
        if (wargame) {
          const combinedState = mergeGameState(effectiveGameProperties, newState)
          // save the game object back to indexed db
          localforage.setItem(`${prefixKey}wargames`, [combinedState])
        }
      } else {
        const res = await updateDocument(newState)
        if (!res.success) {
          console.error('Failed to update game state', res)
        }

      }
    }
  }, [effectiveGameState, effectiveGameProperties, updateDocument, mockWargame, xmppClient])

  return { gameState: effectiveGameState, nextTurn }
}