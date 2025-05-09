import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import RoomPresenceBar from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { ForceConfigType } from '../../../../types/wargame-d'
import * as RoomUsersModule from './useRoomUsers'
import { UseRoomUsersResult } from './useRoomUsers'

// Store the original implementation
const originalUseRoomUsers = RoomUsersModule.useRoomUsers

// Create a mock version of the useRoomUsers hook
let mockUseRoomUsers: UseRoomUsersResult = {
  users: [],
  presenceVisibility: 'all',
  loading: false,
  error: null
}

// Cleanup function to restore the original implementation
const cleanupMock = () => {
  // @ts-expect-error - restoring original implementation
  RoomUsersModule.useRoomUsers = originalUseRoomUsers
}

// Mock force colors for the Storybook
const mockForceColors: Record<string, string> = {
  'red': '#ff4d4f',
  'blue': '#1890ff',
  'umpire': '#722ed1',
  'green': '#52c41a',
  'yellow': '#faad14',
  'purple': '#722ed1',
  'admin': '#262626'
}

// Mock hook results for different scenarios
const mockHookResults: Record<string, UseRoomUsersResult> = {
  online: {
    users: [
      { id: 'user1', name: 'Commander Red', force: 'red', isOnline: true },
      { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: true },
      { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true }
    ],
    presenceVisibility: 'all',
    loading: false,
    error: null
  },
  offline: {
    users: [
      { id: 'user1', name: 'Commander Red', force: 'red', isOnline: false },
      { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: false },
      { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true }
    ],
    presenceVisibility: 'all',
    loading: false,
    error: null
  },
  diverse: {
    users: [
      { id: 'user1', name: 'Commander Red Team Alpha', force: 'red', isOnline: true },
      { id: 'user2', name: 'Commander Blue Squadron', force: 'blue', isOnline: true },
      { id: 'user3', name: 'Chief Umpire', force: 'umpire', isOnline: true },
      { id: 'user4', name: 'Green Force Leader', force: 'green', isOnline: true },
      { id: 'user5', name: 'Yellow Team Captain', force: 'yellow', isOnline: true },
      { id: 'user6', name: 'Purple Squad', force: 'purple', isOnline: true }
    ],
    presenceVisibility: 'all',
    loading: false,
    error: null
  },
  empty: {
    users: [],
    presenceVisibility: 'all',
    loading: false,
    error: null
  },
  umpiresOnly: {
    users: [
      { id: 'user1', name: 'Commander Red', force: 'red', isOnline: true },
      { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: true },
      { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true }
    ],
    presenceVisibility: 'umpires-only',
    loading: false,
    error: null
  },
  loading: {
    users: [],
    presenceVisibility: 'all',
    loading: true,
    error: null
  },
  error: {
    users: [],
    presenceVisibility: 'all',
    loading: false,
    error: 'Failed to load users'
  }
}

interface StoryParams {
  parameters?: {
    mockHookResult?: string
    currentUserForce?: string
    isAdmin?: boolean
  }
}

// Mock WargameProvider wrapper for stories
const WargameProviderDecorator = (Story: React.ComponentType, context: StoryParams) => {
  const { parameters } = context || {}
  
  // Create a mock implementation of the getForce method
  const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
    return {
      type: 'force-config-type-v1',
      id: forceId,
      name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
      color: mockForceColors[forceId] || '#000000'
    }
  }

  // Get the mock hook result based on story parameters
  const mockHookResult = parameters?.mockHookResult || 'online'
  
  // Set up the mock hook result
  mockUseRoomUsers = mockHookResults[mockHookResult as string]
  
  // Override the useRoomUsers hook for this render
  // @ts-expect-error - overriding for Storybook
  RoomUsersModule.useRoomUsers = () => mockUseRoomUsers
  
  // Add cleanup when the component unmounts
  React.useEffect(() => {
    return () => {
      cleanupMock()
    }
  }, [])

  // Mock WargameContext value
  const wargameContextValue = {
    loggedIn: true,
    xmppClient: null,
    setXmppClient: () => {},
    raDataProvider: undefined,
    setRaDataProvider: () => {},
    mockPlayerId: null,
    setMockPlayerId: () => {},
    playerDetails: {
      id: 'current-user',
      role: parameters?.isAdmin ? 'admin' : 'player',
      forceId: parameters?.currentUserForce || 'red',
      forceName: 'Red Force',
      color: mockForceColors[parameters?.currentUserForce || 'red']
    },
    getForce: mockGetForce,
    gameProperties: null,
    gameState: null,
    nextTurn: async () => {}
  }

  return (
    <WargameContext.Provider value={wargameContextValue}>
      <Story />
    </WargameContext.Provider>
  )
}

const meta: Meta<typeof RoomPresenceBar> = {
  title: 'PlayerView/Rooms/RoomPresenceBar',
  component: RoomPresenceBar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  decorators: [WargameProviderDecorator]
}

export default meta
type Story = StoryObj<typeof RoomPresenceBar>

// Online players (3 example entries)
export const OnlinePlayers: Story = {
  parameters: {
    mockHookResult: 'online',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Empty state
export const EmptyState: Story = {
  parameters: {
    mockHookResult: 'empty',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Config variations: "all" vs "umpires-only"
export const AllUsers: Story = {
  parameters: {
    mockHookResult: 'online',
    currentUserForce: 'red',
    isAdmin: false
  }
}

export const UmpiresOnly: Story = {
  parameters: {
    mockHookResult: 'umpiresOnly',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Mixed online/offline users
export const MixedOnlineStatus: Story = {
  parameters: {
    mockHookResult: 'offline',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Admin view (sees all users regardless of config)
export const AdminView: Story = {
  parameters: {
    mockHookResult: 'online',
    currentUserForce: 'admin',
    isAdmin: true
  }
}

// Story with diverse forces and longer names to demonstrate color-coded icons and name wrapping
export const DiverseForces: Story = {
  parameters: {
    mockHookResult: 'diverse',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Loading state
export const Loading: Story = {
  parameters: {
    mockHookResult: 'loading',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Error state
export const Error: Story = {
  parameters: {
    mockHookResult: 'error',
    currentUserForce: 'red',
    isAdmin: false
  }
}
