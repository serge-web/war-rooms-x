import { useCallback } from 'react'
import { mockGameState } from '../UserDetails/mockData'
import { useWargame } from '../../../contexts/WargameContext'
import { GameStateType } from '../../../types/wargame-d'
import { incrementState } from './incrementState'
import { usePubSub } from '../../../hooks/usePubSub'

export const useGameState = () => {
  const { xmppClient } = useWargame()
  const { document: gameState, updateDocument } = usePubSub<GameStateType>('game-state')
  
  // If XMPP client is null (not undefined), use mock data
  const effectiveGameState = xmppClient === null ? mockGameState : gameState
  
  const nextTurn = useCallback(async () => {
    if (effectiveGameState) {
      const newState = incrementState(effectiveGameState)
      const res = await updateDocument(newState)
      if (!res.success) {
        console.error('Failed to update game state', res)
      }
    }
  }, [effectiveGameState, updateDocument])

  return { gameState: effectiveGameState, nextTurn }
}