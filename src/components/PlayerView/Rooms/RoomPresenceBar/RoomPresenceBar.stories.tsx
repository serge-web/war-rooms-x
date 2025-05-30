import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import RoomPresenceBar from './index'
import type { ForceConfigType } from '../../../../types/wargame-d'
import type { OnlineUser, PresenceVisibility } from '../../../../types/rooms-d'

// Mock force colors for the Storybook
const mockForceColors: Record<string, string> = {
  red: '#ff4d4f',
  blue: '#1890ff',
  green: '#52c41a',
  yellow: '#faad14',
  purple: '#722ed1',
  umpire: '#8c8c8c',
  admin: '#000000'
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

// Mock getForce function for stories
const mockGetForce = async (forceId: string): Promise<ForceConfigType> => ({
  type: 'force-config-type-v1',
  id: forceId,
  name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
  color: mockForceColors[forceId] || '#000000',
  objectives: 'Complete mission objectives'
})

const meta: Meta<typeof RoomPresenceBar> = {
  title: 'PlayerView/Rooms/RoomPresenceBar',
  component: RoomPresenceBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays a list of users in the room with their online status and force affiliation.'
      }
    }
  },
  args: {
    getForce: mockGetForce,
    visibilityConfig: 'all',
    isAdmin: false,
    users: mockUsers.online,
    currentUserForce: 'red'
  },
  tags: ['autodocs']
}

type Story = StoryObj<typeof RoomPresenceBar>

// Online players (3 example entries)
export const OnlinePlayers: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows 3 online users from different forces.'
      }
    }
  }
}

// Empty state
export const EmptyState: Story = {
  args: {
    users: [],
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Config variations: "all" vs "umpires-only"
export const AllUsers: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'all' as PresenceVisibility,
    currentUserForce: 'red',
    isAdmin: false
  }
}

export const UmpiresOnly: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'umpires-only' as PresenceVisibility,
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Mixed online/offline users
export const MixedOnlineStatus: Story = {
  args: {
    users: mockUsers.offline,
    visibilityConfig: 'all' as PresenceVisibility,
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Admin view (sees all users regardless of config)
export const AdminView: Story = {
  args: {
    users: mockUsers.online,
    visibilityConfig: 'umpires-only' as PresenceVisibility,
    currentUserForce: 'admin',
    isAdmin: true
  }
}

// Story with diverse forces and longer names to demonstrate color-coded icons and name wrapping
export const DiverseForces: Story = {
  args: {
    users: mockUsers.diverse,
    visibilityConfig: 'all' as PresenceVisibility,
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Dynamic presence simulator
const DynamicPresenceSimulator = () => {
  const [users, setUsers] = useState<OnlineUser[]>([...mockUsers.diverse])

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(currentUsers => {
        const randomIndex = Math.floor(Math.random() * currentUsers.length)
        const updatedUsers = [...currentUsers]
        updatedUsers[randomIndex] = {
          ...updatedUsers[randomIndex],
          isOnline: !updatedUsers[randomIndex].isOnline
        }
        return updatedUsers
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <RoomPresenceBar
      users={users}
      visibilityConfig="all"
      currentUserForce="red"
      isAdmin={false}
      getForce={mockGetForce}
    />
  )
}

// Story with dynamic presence changes
export const WithDynamicPresence: Story = {
  render: () => <DynamicPresenceSimulator />,
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates users whose presence changes dynamically. Every few seconds, a random user will toggle between online and offline status.'
      }
    }
  }
}

export default meta