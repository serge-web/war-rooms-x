import { useState, useEffect } from 'react'
import { mockGameState } from '../UserDetails/mockData';
import { useWargame } from '../../../contexts/WargameContext';
import { GameStateType } from '../../../types/wargame';

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
          const gameState = await xmppClient.getPubSubDocument('game-state')
          console.log('game state', gameState)
          // setGameState(gameState)
        }
      }
    }
    
    fetchGameState()
  }, [xmppClient, xmppClient?.pubsubService]);

  return { gameState };
}