import { GameStateType, GamePropertiesType } from '../../../types/wargame-d'
import { advanceTurn } from '../../../helpers/turn-model'

export const incrementState = (
  gameState: GameStateType,
  gameProperties?: GamePropertiesType
): GameStateType => {
  if (gameProperties) {
    return advanceTurn(gameState, gameProperties)
  }
  
  // Fallback to simple increment if game properties are not available
  const currentTurn = parseInt(gameState?.turn, 10) || 0
  return {
    ...gameState,
    turn: String(currentTurn + 1)
  }
}
