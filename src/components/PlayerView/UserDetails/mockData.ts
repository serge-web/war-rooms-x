// Mock data for UserDetails component

import { ForceConfigType, GameStateType, UserDetailsType } from "../../../types/wargame-d"

export interface MockForceDetails {
  name: string
  color: string
}

export const mockForceData: ForceConfigType = {
  type: 'force-config-type-v1',
  id: '1',
  name: 'Blue Force',
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
