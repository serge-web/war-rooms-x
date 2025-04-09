import { useState, ReactNode } from 'react'
import { GameStateType } from '../types/wargame'
import { WargameContext } from './WargameContext'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [gameState, setGameState] = useState<GameStateType | null>(null)

  const value = {
    loggedIn,
    setLoggedIn,
    gameState,
    setGameState
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
