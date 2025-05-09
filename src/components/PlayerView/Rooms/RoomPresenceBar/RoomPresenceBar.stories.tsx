import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import RoomPresenceBar from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { ForceConfigType } from '../../../../types/wargame-d'

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

// Mock WargameProvider wrapper for stories
const WargameProviderDecorator = (Story: React.ComponentType) => {
  // Create a mock implementation of the getForce method
  const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
    return {
      type: 'force-config-type-v1',
      id: forceId,
      name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
      color: mockForceColors[forceId] || '#000000'
    }
  }

  // Mock WargameContext value
  const wargameContextValue = {
    loggedIn: true,
    xmppClient: null,
    setXmppClient: () => {},
    raDataProvider: undefined,
    setRaDataProvider: () => {},
    mockPlayerId: null,
    setMockPlayerId: () => {},
    playerDetails: null,
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
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    visibilityConfig: {
      control: { type: 'radio' },
      options: ['all', 'umpires-only'],
    },
  },
  decorators: [WargameProviderDecorator]
}

export default meta
type Story = StoryObj<typeof RoomPresenceBar>

// Mock data for stories
const mockUsers = [
  { id: 'user1', name: 'Commander Red', force: 'red', isOnline: true },
  { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: true },
  { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true },
]

const mockOfflineUsers = [
  { id: 'user1', name: 'Commander Red', force: 'red', isOnline: false },
  { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: false },
  { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true },
]

// Mock data with more diverse forces and longer names
const mockDiverseUsers = [
  { id: 'user1', name: 'Commander Red Team Alpha', force: 'red', isOnline: true },
  { id: 'user2', name: 'Commander Blue Squadron', force: 'blue', isOnline: true },
  { id: 'user3', name: 'Chief Umpire', force: 'umpire', isOnline: true },
  { id: 'user4', name: 'Green Force Leader', force: 'green', isOnline: true },
  { id: 'user5', name: 'Yellow Team Captain', force: 'yellow', isOnline: true },
  { id: 'user6', name: 'Purple Squad', force: 'purple', isOnline: true },
]

// Online players (3 example entries)
export const OnlinePlayers: Story = {
  args: {
    users: mockUsers,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false,
  },
}

// Empty state
export const EmptyState: Story = {
  args: {
    users: [],
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false,
  },
}

// Config variations: "all" vs "umpires-only"
export const AllUsers: Story = {
  args: {
    users: mockUsers,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false,
  },
}

export const UmpiresOnly: Story = {
  args: {
    users: mockUsers,
    visibilityConfig: 'umpires-only',
    currentUserForce: 'red',
    isAdmin: false,
  },
}

// Mixed online/offline users
export const MixedOnlineStatus: Story = {
  args: {
    users: mockOfflineUsers,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false,
  },
}

// Admin view (sees all users regardless of config)
export const AdminView: Story = {
  args: {
    users: mockUsers,
    visibilityConfig: 'umpires-only', // Even with this restriction, admin sees all
    currentUserForce: 'admin',
    isAdmin: true,
  },
}

// Story with diverse forces and longer names to demonstrate color-coded icons and name wrapping
export const DiverseForces: Story = {
  args: {
    users: mockDiverseUsers,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false,
  },
}
