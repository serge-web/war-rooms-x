// Mock data for UserDetails component

export interface MockForceDetails {
  name: string
  color: string
}

export interface MockUserDetails {
  username: string
  role: string
  status: 'online' | 'away' | 'offline'
}

export const mockForceDetails: MockForceDetails = {
  name: 'Blue Force',
  color: '#1677ff'
}

export const mockUserDetails: MockUserDetails = {
  username: 'Commander_Alpha',
  role: 'Force Commander',
  status: 'online'
}
