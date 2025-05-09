import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState } from 'react'
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

// Mock user data for stories
const mockUsers = {
  online: [
    { id: 'user1', name: 'Commander Red', force: 'red', isOnline: true },
    { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: true },
    { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true }
  ],
  offline: [
    { id: 'user1', name: 'Commander Red', force: 'red', isOnline: false },
    { id: 'user2', name: 'Commander Blue', force: 'blue', isOnline: false },
    { id: 'user3', name: 'Umpire', force: 'umpire', isOnline: true }
  ],
  diverse: [
    { id: 'user1', name: 'Commander Red Team Alpha', force: 'red', isOnline: true },
    { id: 'user2', name: 'Commander Blue Squadron', force: 'blue', isOnline: true },
    { id: 'user3', name: 'Chief Umpire', force: 'umpire', isOnline: true },
    { id: 'user4', name: 'Green Force Leader', force: 'green', isOnline: true },
    { id: 'user5', name: 'Yellow Team Captain', force: 'yellow', isOnline: true },
    { id: 'user6', name: 'Purple Squad', force: 'purple', isOnline: true }
  ],
  empty: []
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
    layout: 'centered'
  },
  tags: ['autodocs'],
  decorators: [WargameProviderDecorator]
}

export default meta
type Story = StoryObj<typeof RoomPresenceBar>

// Online players (3 example entries)
export const OnlinePlayers: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Empty state
export const EmptyState: Story = {
  args: {
    users: mockUsers.empty,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Config variations: "all" vs "umpires-only"
export const AllUsers: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

export const UmpiresOnly: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'umpires-only',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Mixed online/offline users
export const MixedOnlineStatus: Story = {
  args: {
    users: mockUsers.offline,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Admin view (sees all users regardless of config)
export const AdminView: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'umpires-only', // Even with this restriction, admin sees all
    currentUserForce: 'admin',
    isAdmin: true
  }
}

// Story with diverse forces and longer names to demonstrate color-coded icons and name wrapping
export const DiverseForces: Story = {
  args: {
    users: mockUsers.diverse,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Component that simulates changing presence status
const DynamicPresenceSimulator = () => {
  const [users, setUsers] = useState([...mockUsers.diverse])
  
  useEffect(() => {
    // Function to toggle a random user's online status
    const toggleRandomUserStatus = () => {
      setUsers(currentUsers => {
        // Create a copy of the current users array
        const updatedUsers = [...currentUsers]
        
        // Select a random user
        const randomIndex = Math.floor(Math.random() * updatedUsers.length)
        
        // Toggle their online status
        updatedUsers[randomIndex] = {
          ...updatedUsers[randomIndex],
          isOnline: !updatedUsers[randomIndex].isOnline
        }
        
        return updatedUsers
      })
    }
    
    // Set up an interval to toggle user presence every few seconds
    const intervalId = setInterval(toggleRandomUserStatus, 3000)
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])
  
  return (
    <RoomPresenceBar
      users={users}
      visibilityConfig='all'
      currentUserForce='red'
      isAdmin={false}
    />
  )
}

// Decorator that wraps the dynamic presence simulator
const DynamicPresenceDecorator = (Story: React.ComponentType) => {
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
  const dynamicWargameContextValue = {
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
    <WargameContext.Provider value={dynamicWargameContextValue}>
      <Story />
    </WargameContext.Provider>
  )
}

// Story with dynamic presence changes
export const WithDynamicPresence: Story = {
  render: () => <DynamicPresenceSimulator />,
  decorators: [DynamicPresenceDecorator],
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates users whose presence changes dynamically. Every few seconds, a random user will toggle between online and offline status.'
      }
    }
  }
}
