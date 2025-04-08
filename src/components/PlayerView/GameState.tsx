import React from 'react'

const GameState: React.FC = () => {
  return (
    <div>
      <strong>Game State</strong>
      <div className="game-state-container">
        {/* Game state information will be displayed here */}
        <p>Waiting for game to start...</p>
      </div>
    </div>
  )
}

export default GameState
