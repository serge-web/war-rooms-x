import { GamePropertiesType, GameStateType } from '../../types/wargame-d'
import { 
  advanceTurn, 
  advanceLinearTurn, 
  advancePlanAdjudicateTurn 
} from '../../helpers/turn-model'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../../types/constants'

describe('Turn Model Helpers', () => {
  // Test data
  const baseGameProperties: GamePropertiesType = {
    name: 'Test Game',
    startTime: '2025-04-25T12:00:00Z',
    interval: '1h',
    turnType: LINEAR_TURNS
  }

  const baseGameState: GameStateType = {
    turn: '1',
    currentTime: '2025-04-25T12:00:00Z',
    currentPhase: 'Active'
  }

  describe('advanceLinearTurn', () => {
    it('should increment the turn number and keep phase as Active', () => {
      const result = advanceLinearTurn(baseGameState)
      
      expect(result.turn).toBe('2')
      expect(result.currentPhase).toBe('Active')
      expect(result.currentTime).toBe(baseGameState.currentTime)
    })

    it('should handle string turn numbers correctly', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: '5'
      }
      
      const result = advanceLinearTurn(state)
      
      expect(result.turn).toBe('6')
      expect(result.currentPhase).toBe('Active')
    })

    it('should handle non-numeric turn values by starting from 0', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: 'not-a-number'
      }
      
      const result = advanceLinearTurn(state)
      
      expect(result.turn).toBe('1')
      expect(result.currentPhase).toBe('Active')
    })
  })

  describe('advancePlanAdjudicateTurn', () => {
    it('should advance from Planning (a) to Adjudication (b) in the same cycle', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: '1.a',
        currentPhase: 'Planning'
      }
      
      const result = advancePlanAdjudicateTurn(state)
      
      expect(result.turn).toBe('1.b')
      expect(result.currentPhase).toBe('Adjudication')
    })

    it('should advance from Adjudication (b) to Planning (a) in the next cycle', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: '1.b',
        currentPhase: 'Adjudication'
      }
      
      const result = advancePlanAdjudicateTurn(state)
      
      expect(result.turn).toBe('2.a')
      expect(result.currentPhase).toBe('Planning')
    })

    it('should handle numeric turn values by treating them as cycle numbers', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: '3',
        currentPhase: 'Active'
      }
      
      const result = advancePlanAdjudicateTurn(state)
      
      expect(result.turn).toBe('3.b')
      expect(result.currentPhase).toBe('Adjudication')
    })

    it('should handle invalid turn formats by starting at cycle 1, phase a', () => {
      const state: GameStateType = {
        ...baseGameState,
        turn: 'invalid-format',
        currentPhase: 'Active'
      }
      
      const result = advancePlanAdjudicateTurn(state)
      
      expect(result.turn).toBe('1.b')
      expect(result.currentPhase).toBe('Adjudication')
    })
  })

  describe('advanceTurn', () => {
    it('should use linear turn model when specified', () => {
      const properties: GamePropertiesType = {
        ...baseGameProperties,
        turnType: LINEAR_TURNS
      }
      
      const result = advanceTurn(baseGameState, properties)
      
      expect(result.turn).toBe('2')
      expect(result.currentPhase).toBe('Active')
    })

    it('should use planning/adjudication turn model when specified - a', () => {
      const properties: GamePropertiesType = {
        ...baseGameProperties,
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      const state: GameStateType = {
        ...baseGameState,
        turn: '1.b',
        currentPhase: 'Adjudication'
      }
      
      const result = advanceTurn(state, properties)
      
      expect(result.turn).toBe('2.a')
      expect(result.currentPhase).toBe('Planning')
    })

    it('should use planning/adjudication turn model when specified - b', () => {
      const properties: GamePropertiesType = {
        ...baseGameProperties,
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      const state: GameStateType = {
        ...baseGameState,
        turn: '2.a',
        currentPhase: 'Planning'
      }
      
      const result = advanceTurn(state, properties)
      
      expect(result.turn).toBe('2.b')
      expect(result.currentPhase).toBe('Adjudication')
    })

    it('should use planning/adjudication turn model when specified - c', () => {
      const properties: GamePropertiesType = {
        ...baseGameProperties,
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      const state: GameStateType = {
        ...baseGameState,
        turn: '1.a',
        currentPhase: 'Planning'
      }
      
      const result = advanceTurn(state, properties)
      
      expect(result.turn).toBe('1.b')
      expect(result.currentPhase).toBe('Adjudication')
    })

    it('should default to linear turn model for unrecognized turn types', () => {
      const properties = {
        ...baseGameProperties,
        turnType: 'UnknownTurnType' as unknown as GamePropertiesType['turnType']
      }
      
      const result = advanceTurn(baseGameState, properties)
      
      expect(result.turn).toBe('2')
      expect(result.currentPhase).toBe('Active')
    })
  })
})
