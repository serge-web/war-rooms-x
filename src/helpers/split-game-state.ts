import { RGameState } from '../components/AdminView/raTypes-d'
import { GamePropertiesType, GameStateType } from '../types/wargame-d'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../types/constants'

/**
 * Split an RGameState object into separate GamePropertiesType and GameStateType objects
 * Uses TypeScript's type system to determine which properties belong to each type
 */
export const splitGameState = (gameState: RGameState): {
  gameProperties: GamePropertiesType,
  gameState: GameStateType
} => {
  // Initialize empty objects
  const gameProperties: Partial<GamePropertiesType> = {}
  const gameStateObj: Partial<GameStateType> = {}
  
  // Get all keys from the input object
  const allKeys = Object.keys(gameState) as Array<keyof RGameState>
  
  // Process each key
  allKeys.forEach(key => {
    // Check if key exists in GamePropertiesType
    const isGamePropertyKey = isKeyOfType<GamePropertiesType>(key)
    
    // Check if key exists in GameStateType
    const isGameStateKey = isKeyOfType<GameStateType>(key)
    
    // Copy to appropriate object(s)
    if (isGamePropertyKey) {
      // Special handling for turnType to ensure type safety
      if (key === 'turnType') {
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
    
    if (isGameStateKey) {
      gameStateObj[key] = gameState[key] as unknown as GameStateType[typeof key]
    }
  })
  
  return { 
    gameProperties: gameProperties as GamePropertiesType, 
    gameState: gameStateObj as GameStateType 
  }
}

/**
 * Type guard to check if a key is a key of type T
 */
function isKeyOfType<T>(key: string | number | symbol): key is keyof T {
  // Create an empty object of type T and check if the key exists in it
  return Object.prototype.hasOwnProperty.call({} as T, key)
}
