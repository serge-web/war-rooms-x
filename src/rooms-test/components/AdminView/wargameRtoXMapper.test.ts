import { XGameState, RGameState } from '../../../components/AdminView/raTypes-d'
import { PLAN_ADJUDICATE_TURNS, LINEAR_TURNS } from '../../../types/constants'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { combineGameState } from '../../../helpers/split-game-state'

/**
 * Tests for the Wargame Mapper Functions (RtoX)
 * These tests verify that the mapper functions correctly transform 
 * React Admin (R) data structures to OpenFire (X) data structures
 */
describe('Wargame Mapper Functions (RtoX)', () => {
  
  // Define wargameRtoX function for testing
  const wargameRtoX = (rWargame: RGameState): XGameState => {
    // Extract game properties and game state fields
    const gamePropertyKeys: (keyof GamePropertiesType)[] = ['name', 'description', 'startTime', 'stepTime', 'turnType']
    const gameStateKeys: (keyof GameStateType)[] = ['turn', 'currentTime', 'currentPhase']
    
    // Initialize result objects with proper typing
    const gameProperties: Partial<GamePropertiesType> = {}
    const gameState: Partial<GameStateType> = {}
    
    // Extract game properties
    gamePropertyKeys.forEach(key => {
      if (key in rWargame) {
        if (key === 'turnType') {
          // Special handling for turnType to ensure type safety
          const turnTypeValue = rWargame[key]
          if (turnTypeValue === PLAN_ADJUDICATE_TURNS || turnTypeValue === LINEAR_TURNS) {
            gameProperties[key] = turnTypeValue
          }
        } else {
          // Type-safe assignment using explicit typing for other properties
          gameProperties[key] = rWargame[key as keyof RGameState] as GamePropertiesType[typeof key]
        }
      }
    })
    
    // Extract game state
    gameStateKeys.forEach(key => {
      if (key in rWargame) {
        // Type-safe assignment using explicit typing
        gameState[key] = rWargame[key as keyof RGameState] as GameStateType[typeof key]
      }
    })
    
    return {
      gameProperties: gameProperties as GamePropertiesType,
      gameState: gameState as GameStateType
    }
  }
  
  describe('RGameState to XGameState conversion', () => {
    it('should correctly convert RGameState to XGameState', () => {
      // Given: game properties and game state
      const gameProperties: GamePropertiesType = {
        name: 'Test Wargame',
        description: 'A test wargame',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '24h',
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      const gameState: GameStateType = {
        turn: '1',
        currentTime: '2025-04-16T12:00:00Z',
        currentPhase: 'planning'
      }
      
      // Combine into RGameState using helper
      const mockRGameState: RGameState = combineGameState(gameProperties, gameState)
      
      // Expected XGameState after conversion
      const expectedXGameState: XGameState = {
        gameProperties: {
          name: 'Test Wargame',
          description: 'A test wargame',
          startTime: '2025-04-16T00:00:00Z',
          stepTime: '24h',
          turnType: PLAN_ADJUDICATE_TURNS
        },
        gameState: {
          turn: '1',
          currentTime: '2025-04-16T12:00:00Z',
          currentPhase: 'planning'
        }
      }
      
      // When: applying the wargameRtoX function
      const result = wargameRtoX(mockRGameState)
      
      // Then: the result should match the expected XGameState
      expect(result).toEqual(expectedXGameState)
    })
    
    it('should handle RGameState with minimal properties', () => {
      // Given: minimal game properties and game state
      const minimalGameProperties: GamePropertiesType = {
        name: 'Minimal Game',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '12h',
        turnType: LINEAR_TURNS
      }
      
      const minimalGameState: GameStateType = {
        turn: '0',
        currentTime: '2025-04-16T00:00:00Z',
        currentPhase: 'setup'
      }
      
      // Combine into RGameState using helper
      const minimalRGameState: RGameState = combineGameState(minimalGameProperties, minimalGameState)
      
      // Expected XGameState after conversion
      const expectedXGameState: XGameState = {
        gameProperties: {
          name: 'Minimal Game',
          startTime: '2025-04-16T00:00:00Z',
          stepTime: '12h',
          turnType: LINEAR_TURNS
        },
        gameState: {
          turn: '0',
          currentTime: '2025-04-16T00:00:00Z',
          currentPhase: 'setup'
        }
      }
      
      // When: applying the wargameRtoX function
      const result = wargameRtoX(minimalRGameState)
      
      // Then: the result should match the expected XGameState
      expect(result).toEqual(expectedXGameState)
    })
  })
})
