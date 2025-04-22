import { RGameState } from "../components/AdminView/raTypes-d"
import { GamePropertiesType, GameStateType } from "../types/wargame-d"

export const splitGameState = (state: RGameState): { gameProperties: GamePropertiesType, gameState: GameStateType } => {
  return { gameProperties: {
    name: state.name,
    description: state.description,
    startTime: state.startTime,
    stepTime: state.stepTime,
    turnType: state.turnType
  }, gameState: {
    turn: state.turn,
    currentTime: state.currentTime,
    currentPhase: state.currentPhase  
  } }
}

export const mergeGameState = (gameProperties: GamePropertiesType, gameState: GameStateType): RGameState => {
  return { id: '0', ...gameProperties, ...gameState }
}
