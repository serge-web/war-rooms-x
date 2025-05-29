import { GameStateType } from '../types/wargame-d'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../types/constants'
import { addDurationToDate } from './durationHelper'

export type TurnPhase = 'Active' | 'Planning' | 'Adjudication'

/**
 * Advances the turn state based on the specified turn model
 * @param currentState - The current game state
 * @param gameProperties - The game properties containing the turn type and interval
 * @returns The new game state with advanced turn and updated time
 */

export const advanceTurn = (
  currentState: GameStateType,
  turnType: string,
  interval: string
): GameStateType => {
  
  // Advance the turn based on turn type
  let newState: GameStateType
  switch (turnType) {
    case LINEAR_TURNS:
      newState = advanceLinearTurn(currentState)
      break
    case PLAN_ADJUDICATE_TURNS:
      newState = advancePlanAdjudicateTurn(currentState)
      break
    default:
      // Default to linear turn model if turnType is not recognized
      newState = advanceLinearTurn(currentState)
  }
  
  // Advance the game time based on the interval
  const currentTime = new Date(currentState.currentTime)
  const newTime = addDurationToDate(currentTime, interval)
  
  return {
    ...newState,
    currentTime: newTime.toISOString()
  }
}

/**
 * Advances the turn using the Linear turn model
 * Simply increments the turn number, leaving the phase as Active
 */
export const advanceLinearTurn = (currentState: GameStateType): GameStateType => {
  const currentTurn = parseInt(currentState.turn, 10) || 0
  
  return {
    ...currentState,
    turn: String(currentTurn + 1),
    currentPhase: 'Active'
  }
}

/**
 * Advances the turn using the Planning/Adjudication turn model
 * The phase switches between Planning and Adjudication
 * Turn number format: <cycle>.<phase> where phase is 'a' for planning and 'b' for adjudication
 */
export const advancePlanAdjudicateTurn = (currentState: GameStateType): GameStateType => {
  const { turn } = currentState
  
  // Parse the current turn format
  let cycle = 1
  let phase = 'a'
  
  if (turn) {
    const turnParts = turn.split('.')
    if (turnParts.length === 2) {
      cycle = parseInt(turnParts[0], 10) || 1
      phase = turnParts[1]
    } else if (turnParts.length === 1 && !isNaN(parseInt(turn, 10))) {
      // If it's just a number, assume it's the cycle number
      cycle = parseInt(turn, 10) || 1
      // Default to phase 'a' (Planning)
      phase = 'a'
    }
  }
  
  // Determine the next turn state
  let nextCycle = cycle
  let nextPhase = phase
  let nextPhaseName: TurnPhase = 'Planning'
  
  if (phase === 'a') {
    // If current phase is 'a' (Planning), move to 'b' (Adjudication)
    nextPhase = 'b'
    nextPhaseName = 'Adjudication'
  } else {
    // If current phase is 'b' (Adjudication), move to next cycle's 'a' (Planning)
    nextCycle = cycle + 1
    nextPhase = 'a'
    nextPhaseName = 'Planning'
  }
  
  return {
    ...currentState,
    turn: `${nextCycle}.${nextPhase}`,
    currentPhase: nextPhaseName
  }
}
