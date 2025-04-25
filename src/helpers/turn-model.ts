import { GamePropertiesType, GameStateType } from '../types/wargame-d'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../types/constants'

export type TurnPhase = 'Active' | 'Planning' | 'Adjudication'

/**
 * Advances the turn state based on the specified turn model
 * @param currentState - The current game state
 * @param gameProperties - The game properties containing the turn type
 * @returns The new game state with advanced turn
 */
export const advanceTurn = (
  currentState: GameStateType,
  gameProperties: GamePropertiesType
): GameStateType => {
  const { turnType } = gameProperties

  switch (turnType) {
    case LINEAR_TURNS:
      return advanceLinearTurn(currentState)
    case PLAN_ADJUDICATE_TURNS:
      return advancePlanAdjudicateTurn(currentState)
    default:
      // Default to linear turn model if turnType is not recognized
      return advanceLinearTurn(currentState)
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
