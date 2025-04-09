import { useState, ReactNode } from 'react'
import { ForceDetails, GameStateType, RoomType, UserDetailsType } from '../types/wargame'
import { WargameContext } from './WargameContext'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [playerForce, setPlayerForce] = useState<ForceDetails | null>(null)
  const [playerDetails, setPlayerDetails] = useState<UserDetailsType | null>(null)    

  const value = {
    loggedIn,
    setLoggedIn,
    gameState,
    setGameState,
    rooms,
    setRooms,
    playerForce,
    setPlayerForce,
    playerDetails,
    setPlayerDetails
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
