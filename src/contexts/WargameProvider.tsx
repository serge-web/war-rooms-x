import { useState, ReactNode } from 'react'
import { ForceDetails, GameStateType, UserDetailsType } from '../types/wargame'
import { WargameContext } from './WargameContext'
import { RoomType } from '../types/rooms'

interface WargameProviderProps {
  children: ReactNode
}

export const WargameProvider = ({ children }: WargameProviderProps) => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [playerForce, setPlayerForce] = useState<ForceDetails | null>(null)
  const [playerDetails, setPlayerDetails] = useState<UserDetailsType | null>(null)   
  const [useMock, setUseMock] = useState(false) 

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
    setPlayerDetails,
    useMock,
    setUseMock
  }

  return (
    <WargameContext.Provider value={value}>
      {children}
    </WargameContext.Provider>
  )
}
