import { Meta, StoryObj } from '@storybook/react'
import RoomPresenceBar from './index'

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
