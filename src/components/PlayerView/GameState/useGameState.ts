import { useCallback, useMemo } from 'react'
import { useWargame } from '../../../contexts/WargameContext'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { incrementState } from './incrementState'
import { usePubSub } from '../../../hooks/usePubSub'
import { useIndexedDBData } from '../../../hooks/useIndexedDBData'
import { RGameState } from '../../AdminView/raTypes-d'
import { splitGameState } from '../../../helpers/split-game-state'

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
  
  const nextTurn = useCallback(async () => {
    if (effectiveGameState && gameProperties) {
      const newState = incrementState(effectiveGameState, gameProperties)
      const res = await updateDocument(newState)
      if (!res.success) {
        console.error('Failed to update game state', res)
      }
    }
  }, [effectiveGameState, gameProperties, updateDocument])

  return { gameState: effectiveGameState, nextTurn }
}