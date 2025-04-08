import React from 'react'
import { useWargame } from '../../hooks/useWargame'

const GameState: React.FC = () => {
  const { gameState, loading } = useWargame()

  if (loading) {
    return (
      <div className='p-4 bg-gray-100 rounded-md'>
        <strong>Game State</strong>
        <div className='game-state-container'>
          <p>Loading game state...</p>
        </div>
      </div>
    )
  }

  // Format the date for display
  const formattedDate = gameState ? new Date(gameState.currentTime).toLocaleString() : ''

  return (
    <div className='p-4 bg-gray-100 rounded-md'>
      <strong>Game State</strong>
      <div className='game-state-container'>
        {gameState ? (
          <div className='space-y-2'>
            <p data-testid='turn-number'>Turn: {gameState.turn}</p>
            <p data-testid='current-time'>Time: {formattedDate}</p>
            <p data-testid='current-phase'>Phase: {gameState.currentPhase}</p>
          </div>
        ) : (
          <p>No game state available</p>
        )}
      </div>
    </div>
  )
}

export default GameState
