// Mock data for UserDetails component

import { ForceDetails, GameStateType, UserDetailsType } from "../../../types/wargame"

export interface MockForceDetails {
  name: string
  color: string
}

export const mockForceData: ForceDetails = {
  fullName: 'Blue Force',
  color: '#1677ff'
}

export const mockUserDetails: UserDetailsType = {
  username: 'Commander_Alpha',
  name: 'Commander'
}

export const mockGameState: GameStateType = {
  turn: "3",
  currentTime: '2025-04-08T15:30:00Z',
  currentPhase: 'Planning'
}
