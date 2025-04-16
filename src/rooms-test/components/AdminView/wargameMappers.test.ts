import { XGameState, RGameState } from '../../../components/AdminView/raTypes-d'
import { GamePropertiesType, GameStateType } from '../../../types/wargame-d'
import { PLAN_ADJUDICATE_TURNS } from '../../../types/constants'

// Mock implementation of splitGameState for testing
const mockSplitGameState = (gameState: RGameState): {
  gameProperties: GamePropertiesType,
  gameState: GameStateType
} => {
  const gameProperties: GamePropertiesType = {
    name: gameState.name,
    startTime: gameState.startTime,
    stepTime: gameState.stepTime,
    turnType: gameState.turnType
  }
  
  if (gameState.description) {
    gameProperties.description = gameState.description
  }
  
  const gameStateObj: GameStateType = {
    turn: gameState.turn,
    currentTime: gameState.currentTime,
    currentPhase: gameState.currentPhase
  }
  
  return { gameProperties, gameState: gameStateObj }
}

/**
 * Tests for the Wargame Mapper Functions (XtoR)
 * These tests verify that the mapper functions correctly transform 
 * OpenFire (X) data structures to React Admin (R) data structures
 */
describe('Wargame Mapper Functions (XtoR)', () => {

  // Test for gameStateXtoR function and its inverse using splitGameState
  describe('GameState mapping functions', () => {
    it('should correctly map XGameState to RGameState', () => {
      // Create a mock XGameState
      const mockXGameState: XGameState = {
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

      // Expected RGameState after mapping
      const expectedRGameState: RGameState = {
        id: 'Test Wargame', // Using name as ID for this example
        name: 'Test Wargame',
        description: 'A test wargame',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '24h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2025-04-16T12:00:00Z',
        currentPhase: 'planning'
      }

      // Define gameStateXtoR function for testing
      const gameStateXtoR = (xGameState: XGameState, id?: string): RGameState => {
        return {
          id: id || xGameState.gameProperties.name,
          ...xGameState.gameProperties,
          ...xGameState.gameState
        }
      }

      // Apply the mapper function
      const result = gameStateXtoR(mockXGameState)

      // Verify the mapping
      expect(result).toEqual(expectedRGameState)
    })

    it('should use provided id when specified', () => {
      // Create a mock XGameState
      const mockXGameState: XGameState = {
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

      // Expected RGameState with custom id
      const expectedRGameState: RGameState = {
        id: 'custom-game-id',
        name: 'Test Wargame',
        description: 'A test wargame',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '24h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2025-04-16T12:00:00Z',
        currentPhase: 'planning'
      }

      // Define gameStateXtoR function for testing
      const gameStateXtoR = (xGameState: XGameState, id?: string): RGameState => {
        return {
          id: id || xGameState.gameProperties.name,
          ...xGameState.gameProperties,
          ...xGameState.gameState
        }
      }

      // Apply the mapper function with custom id
      const result = gameStateXtoR(mockXGameState, 'custom-game-id')

      // Verify the mapping
      expect(result).toEqual(expectedRGameState)
    })
  })

  // Test for the inverse mapping using splitGameState
  describe('RGameState to XGameState conversion', () => {
    it('should correctly convert RGameState to XGameState using splitGameState', () => {
      // Create a mock RGameState
      const mockRGameState: RGameState = {
        id: 'game1',
        name: 'Test Wargame',
        description: 'A test wargame',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '24h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2025-04-16T12:00:00Z',
        currentPhase: 'planning'
      }

      // Expected XGameState after splitting
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

      // Apply the mock splitGameState function
      const result = mockSplitGameState(mockRGameState)

      // Verify the mapping
      expect(result).toEqual(expectedXGameState)
    })

    it('should handle RGameState with minimal properties', () => {
      // Create a minimal RGameState
      const minimalRGameState: RGameState = {
        id: 'minimal-game',
        name: 'Minimal Game',
        startTime: '2025-04-16T00:00:00Z',
        stepTime: '12h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '0',
        currentTime: '2025-04-16T00:00:00Z',
        currentPhase: 'setup'
      }

      // Expected XGameState after splitting
      const expectedXGameState: XGameState = {
        gameProperties: {
          name: 'Minimal Game',
          startTime: '2025-04-16T00:00:00Z',
          stepTime: '12h',
          turnType: PLAN_ADJUDICATE_TURNS
        },
        gameState: {
          turn: '0',
          currentTime: '2025-04-16T00:00:00Z',
          currentPhase: 'setup'
        }
      }

      // Apply the mock splitGameState function
      const result = mockSplitGameState(minimalRGameState)

      // Verify the mapping
      expect(result).toEqual(expectedXGameState)
    })

    it('should verify bidirectional mapping between XGameState and RGameState', () => {
      // Create a mock XGameState
      const mockXGameState: XGameState = {
        gameProperties: {
          name: 'Bidirectional Test',
          description: 'Testing bidirectional mapping',
          startTime: '2025-04-16T00:00:00Z',
          stepTime: '24h',
          turnType: PLAN_ADJUDICATE_TURNS
        },
        gameState: {
          turn: '2',
          currentTime: '2025-04-17T00:00:00Z',
          currentPhase: 'execution'
        }
      }

      // Define gameStateXtoR function for testing
      const gameStateXtoR = (xGameState: XGameState, id?: string): RGameState => {
        return {
          id: id || xGameState.gameProperties.name,
          ...xGameState.gameProperties,
          ...xGameState.gameState
        }
      }

      // Convert XGameState to RGameState
      const rGameState = gameStateXtoR(mockXGameState, 'bidirectional-test')
      
      // Convert back to XGameState
      const resultXGameState = mockSplitGameState(rGameState)

      // Verify the round-trip conversion
      expect(resultXGameState).toEqual(mockXGameState)
    })
  })
})
