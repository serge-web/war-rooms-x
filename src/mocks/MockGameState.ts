export interface GameStateType {
  turn: number
  currentTime: string
  currentPhase: string
}

export const mockGameState: GameStateType = {
  turn: 3,
  currentTime: '2025-04-08T15:30:00Z',
  currentPhase: 'Planning'
}
