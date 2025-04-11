import { GameStateType } from "../../../types/wargame";

export const incrementState = (gameState: GameStateType): GameStateType => {
  return {
    ...gameState,
    turn: gameState?.turn + 1
  }  
}
