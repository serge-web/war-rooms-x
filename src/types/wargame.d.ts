export interface GameStateType {
  turn: number
  currentTime: string
  currentPhase: string
}


export interface WargameContextType {
  loggedIn: boolean
  setLoggedIn: (value: boolean) => void
  gameState: GameStateType | null
  setGameState: (value: GameStateType | null) => void
}