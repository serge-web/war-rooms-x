import { splitGameState, mergeGameState } from '../../helpers/split-game-state'
import { RGameState } from '../../components/AdminView/raTypes-d'
import { GamePropertiesType, GameStateType } from '../../types/wargame-d'
import { PLAN_ADJUDICATE_TURNS } from '../../types/constants'

describe('Game State Helper Functions', () => {
  describe('splitGameState', () => {
    it('should correctly split an RGameState into gameProperties and gameState', () => {
      // Arrange
      const testGameState: RGameState = {
        id: '0',
        name: 'Test Wargame',
        description: 'Test description',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      }

      // Act
      const result = splitGameState(testGameState)

      // Assert
      expect(result.gameProperties).toEqual({
        name: 'Test Wargame',
        description: 'Test description',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS
      })

      expect(result.gameState).toEqual({
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      })
    })

    it('should handle missing optional fields', () => {
      // Arrange
      const testGameState: RGameState = {
        id: '0',
        name: 'Test Wargame',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      }

      // Act
      const result = splitGameState(testGameState)

      // Assert
      expect(result.gameProperties.description).toBeUndefined()
      expect(result.gameProperties).toEqual({
        name: 'Test Wargame',
        description: undefined,
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS
      })
    })
  })

  describe('mergeGameState', () => {
    it('should correctly merge gameProperties and gameState into RGameState', () => {
      // Arrange
      const gameProperties: GamePropertiesType = {
        name: 'Test Wargame',
        description: 'Test description',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS
      }

      const gameState: GameStateType = {
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      }

      // Act
      const result = mergeGameState(gameProperties, gameState)

      // Assert
      expect(result).toEqual({
        id: '0',
        name: 'Test Wargame',
        description: 'Test description',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS,
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      })
    })

    it('should handle property overriding correctly', () => {
      // Arrange
      const gameProperties: GamePropertiesType = {
        name: 'Test Wargame',
        description: 'Test description',
        startTime: '2023-01-01T00:00:00Z',
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS
      }

      const gameState: GameStateType = {
        turn: '1',
        currentTime: '2023-01-01T01:00:00Z',
        currentPhase: 'planning'
      }

      // Add a property that exists in both objects to test override behavior
      const gamePropertiesWithConflict = {
        ...gameProperties,
        currentPhase: 'should-be-overridden'
      }

      // Act
      const result = mergeGameState(gamePropertiesWithConflict, gameState)

      // Assert
      expect(result.currentPhase).toBe('planning')
    })
  })
})
