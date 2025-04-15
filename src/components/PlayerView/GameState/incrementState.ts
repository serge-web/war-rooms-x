import { GameStateType } from "../../../types/wargame-d";

export const incrementState = (gameState: GameStateType): GameStateType => {
  return {
    ...gameState,
    turn: gameState?.turn + 1
  }  
}
