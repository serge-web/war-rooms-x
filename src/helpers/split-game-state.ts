import { RGameState } from "../components/AdminView/raTypes-d"
import { GamePropertiesType, GameStateType } from "../types/wargame-d"

export const splitGameState = (state: RGameState): { gameProperties: GamePropertiesType, gameState: GameStateType } => {
  const gameProperties: GamePropertiesType = {
    name: state.name,
    description: state.description,
    startTime: state.startTime,
    interval: state.interval,
    turnType: state.turnType,
    playerTheme: state.playerTheme,
    adminTheme: state.adminTheme
  }
  const gameState: GameStateType = {
    turn: state.turn,
    currentTime: state.currentTime,
    currentPhase: state.currentPhase  
  }
  const result: { gameProperties: GamePropertiesType, gameState: GameStateType } = {
    gameProperties, gameState
  }
  return result
}

export const mergeGameState = (gameProperties: GamePropertiesType, gameState: GameStateType): RGameState => {
  return { id: '0', ...gameProperties, ...gameState }
}
