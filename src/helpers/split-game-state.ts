import { RGameState } from '../components/AdminView/raTypes-d'
import { GamePropertiesType, GameStateType } from '../types/wargame-d'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../types/constants'

/**
 * Split an RGameState object into separate GamePropertiesType and GameStateType objects
 * Uses explicit property mapping to determine which properties belong to each type
 */
export const splitGameState = (gameState: RGameState): {
  gameProperties: GamePropertiesType,
  gameState: GameStateType
} => {
  // Define property keys for each type
  const gamePropertyKeys: (keyof GamePropertiesType)[] = [
    'name',
    'description',
    'startTime',
    'stepTime',
    'turnType'
  ]
  
  const gameStateKeys: (keyof GameStateType)[] = [
    'turn',
    'currentTime',
    'currentPhase'
  ]
  
  // Initialize result objects
  const gameProperties: Partial<GamePropertiesType> = {}
  const gameStateObj: Partial<GameStateType> = {}
  
  // Extract game properties
  gamePropertyKeys.forEach(key => {
    if (key in gameState) {
      if (key === 'turnType') {
        // Special handling for turnType to ensure type safety
        const turnTypeValue = gameState[key]
        if (turnTypeValue === PLAN_ADJUDICATE_TURNS || turnTypeValue === LINEAR_TURNS) {
          gameProperties[key] = turnTypeValue
        } else {
          gameProperties[key] = LINEAR_TURNS
        }
      } else {
        // For all other properties - use type assertion with unknown as intermediate step
        gameProperties[key] = gameState[key] as unknown as GamePropertiesType[typeof key]
      }
    }
  })
  
  // Extract game state
  gameStateKeys.forEach(key => {
    if (key in gameState) {
      gameStateObj[key] = gameState[key] as unknown as GameStateType[typeof key]
    }
  })
  
  return { 
    gameProperties: gameProperties as GamePropertiesType, 
    gameState: gameStateObj as GameStateType 
  }
}
