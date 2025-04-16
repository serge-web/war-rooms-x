import { RGameState } from "../../components/AdminView/raTypes-d"
import { splitGameState } from "../../helpers/split-game-state"
import { PLAN_ADJUDICATE_TURNS, LINEAR_TURNS } from "../../types/constants"


describe('splitGameState', () => {
  it('should correctly split an RGameState into GamePropertiesType and GameStateType', () => {
    // Arrange
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

    // Act
    const result = splitGameState(mockRGameState)

    // Assert
    expect(result).toHaveProperty('gameProperties')
    expect(result).toHaveProperty('gameState')

    // Verify gameProperties has correct structure and values
    expect(result.gameProperties).toEqual({
      name: 'Test Wargame',
      description: 'A test wargame',
      startTime: '2025-04-16T00:00:00Z',
      stepTime: '24h',
      turnType: PLAN_ADJUDICATE_TURNS
    })

    // Verify gameState has correct structure and values
    expect(result.gameState).toEqual({
      turn: '1',
      currentTime: '2025-04-16T12:00:00Z',
      currentPhase: 'planning'
    })
  })

  it('should handle RGameState with only gameProperties fields', () => {
    // Arrange
    const mockRGameState: RGameState = {
      id: 'game2',
      name: 'Properties Only',
      startTime: '2025-04-17T00:00:00Z',
      stepTime: '12h',
      turnType: LINEAR_TURNS,
      turn: '', // Empty string for required GameStateType properties
      currentTime: '',
      currentPhase: ''
    }

    // Act
    const result = splitGameState(mockRGameState)

    // Assert
    expect(result.gameProperties).toEqual({
      name: 'Properties Only',
      startTime: '2025-04-17T00:00:00Z',
      stepTime: '12h',
      turnType: LINEAR_TURNS
    })

    expect(result.gameState).toEqual({
      turn: '',
      currentTime: '',
      currentPhase: ''
    })
  })

  it('should handle invalid turnType by defaulting to LINEAR_TURNS', () => {
    // Arrange
    const mockRGameState = {
      id: 'game3',
      name: 'Invalid TurnType',
      startTime: '2025-04-18T00:00:00Z',
      stepTime: '6h',
      turnType: 'InvalidType' as unknown as string, // Intentionally invalid type
      turn: '3',
      currentTime: '2025-04-18T12:00:00Z',
      currentPhase: 'execution'
    } as RGameState

    // Act
    const result = splitGameState(mockRGameState)

    // Assert
    expect(result.gameProperties.turnType).toBe(LINEAR_TURNS)
    expect(result.gameProperties).toEqual({
      name: 'Invalid TurnType',
      startTime: '2025-04-18T00:00:00Z',
      stepTime: '6h',
      turnType: LINEAR_TURNS
    })
  })

  it('should handle additional properties not in either type', () => {
    // Arrange
    const mockRGameState = {
      id: 'game4',
      name: 'Extra Properties',
      startTime: '2025-04-19T00:00:00Z',
      stepTime: '8h',
      turnType: PLAN_ADJUDICATE_TURNS,
      turn: '4',
      currentTime: '2025-04-19T12:00:00Z',
      currentPhase: 'planning',
      extraProperty1: 'should be ignored',
      extraProperty2: 42
    } as unknown as RGameState

    // Act
    const result = splitGameState(mockRGameState)

    // Assert
    // Verify only the correct properties are included
    expect(Object.keys(result.gameProperties)).toEqual([
      'name',
      'startTime',
      'stepTime',
      'turnType'
    ])
    
    expect(Object.keys(result.gameState)).toEqual([
      'turn',
      'currentTime',
      'currentPhase'
    ])
  })
})
