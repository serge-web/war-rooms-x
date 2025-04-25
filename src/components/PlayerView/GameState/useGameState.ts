import { useCallback } from 'react'
import { mockGameState } from '../UserDetails/mockData'
import { useWargame } from '../../../contexts/WargameContext'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { incrementState } from './incrementState'
import { usePubSub } from '../../../hooks/usePubSub'

export const useGameState = () => {
  const { xmppClient } = useWargame()
  const { document: gameState, updateDocument } = usePubSub<GameStateType>('game-state')
  const { document: gameProperties } = usePubSub<GamePropertiesType>('game-setup')
  
  // If XMPP client is null (not undefined), use mock data
  const effectiveGameState = xmppClient === null ? mockGameState : gameState
  
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