import { advanceTurn } from './turn-model'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../types/constants'
import { GamePropertiesType, GameStateType } from '../types/wargame-d'

describe('Turn Model', () => {
  describe('advanceTurn', () => {
    // Base test data
    const baseGameState: GameStateType = {
      turn: '1',
      currentTime: '2023-01-01T12:00:00.000Z',
      currentPhase: 'Active'
    }

    const baseGameProperties: GamePropertiesType = {
      name: 'Test Game',
      startTime: '2023-01-01T10:00:00.000Z',
      interval: 'PT1H', // 1 hour interval
      turnType: LINEAR_TURNS
    }

    it('should advance linear turn and increment time by the specified interval', () => {
      const result = advanceTurn(baseGameState, baseGameProperties)
      
      // Check turn advancement
      expect(result.turn).toBe('2')
      expect(result.currentPhase).toBe('Active')
      
      // Check time advancement (1 hour later)
      expect(result.currentTime).toBe('2023-01-01T13:00:00.000Z')
    })

    it('should advance plan/adjudicate turn and increment time by the specified interval', () => {
      const planAdjudicateState: GameStateType = {
        ...baseGameState,
        turn: '1.a',
        currentPhase: 'Planning'
      }
      
      const planAdjudicateProps: GamePropertiesType = {
        ...baseGameProperties,
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      const result = advanceTurn(planAdjudicateState, planAdjudicateProps)
      
      // Check turn advancement
      expect(result.turn).toBe('1.b')
      expect(result.currentPhase).toBe('Adjudication')
      
      // Check time advancement (1 hour later)
      expect(result.currentTime).toBe('2023-01-01T13:00:00.000Z')
    })

    it('should handle different interval durations correctly', () => {
      // Test with 30 minutes
      const thirtyMinProps: GamePropertiesType = {
        ...baseGameProperties,
        interval: 'PT30M'
      }
      
      const thirtyMinResult = advanceTurn(baseGameState, thirtyMinProps)
      expect(thirtyMinResult.currentTime).toBe('2023-01-01T12:30:00.000Z')
      
      // Test with 1 day
      const oneDayProps: GamePropertiesType = {
        ...baseGameProperties,
        interval: 'P1D'
      }
      
      const oneDayResult = advanceTurn(baseGameState, oneDayProps)
      expect(oneDayResult.currentTime).toBe('2023-01-02T12:00:00.000Z')
    })

    it('should handle legacy numeric interval format (minutes)', () => {
      const legacyProps: GamePropertiesType = {
        ...baseGameProperties,
        interval: '45' // 45 minutes in legacy format
      }
      
      const result = advanceTurn(baseGameState, legacyProps)
      expect(result.currentTime).toBe('2023-01-01T12:45:00.000Z')
    })

    it('should advance through a complete plan/adjudicate cycle', () => {
      // Start with planning phase
      const planningState: GameStateType = {
        turn: '1.a',
        currentTime: '2023-01-01T12:00:00.000Z',
        currentPhase: 'Planning'
      }
      
      const planAdjudicateProps: GamePropertiesType = {
        ...baseGameProperties,
        turnType: PLAN_ADJUDICATE_TURNS
      }
      
      // Advance to adjudication phase
      const adjudicationState = advanceTurn(planningState, planAdjudicateProps)
      expect(adjudicationState.turn).toBe('1.b')
      expect(adjudicationState.currentPhase).toBe('Adjudication')
      expect(adjudicationState.currentTime).toBe('2023-01-01T13:00:00.000Z')
      
      // Advance to next cycle's planning phase
      const nextPlanningState = advanceTurn(adjudicationState, planAdjudicateProps)
      expect(nextPlanningState.turn).toBe('2.a')
      expect(nextPlanningState.currentPhase).toBe('Planning')
      expect(nextPlanningState.currentTime).toBe('2023-01-01T14:00:00.000Z')
    })
  })
})
