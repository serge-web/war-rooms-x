import { Meta, StoryObj } from '@storybook/react'
import { RoomContentCore } from './index'
import { GameMessage, PresenceVisibility, RoomType } from '../../../../types/rooms-d'
import { ThemeConfig } from 'antd'
import { ForceConfigType } from '../../../../types/wargame-d'

// Mock data
const mockRoom: RoomType = {
  roomName: 'blue-chat',
  naturalName: 'Blue Force Chat',
  description: JSON.stringify({
    theme: {
      token: {
        colorPrimary: '#1890ff'
      }
    },
    description: 'A test chat room for storybook',
    specifics: {
      roomType: 'chat'
    }
  })
}

const mockMessages = [
  {
    id: 'msg-1',
    details: {
      messageType: 'chat',
      senderId: 'user1',
      senderName: 'Blue User',
      senderForce: 'blue',
      turn: '1',
      phase: 'planning',
      timestamp: new Date().toISOString(),
      channel: 'blue-chat'
    },
    content: { text: 'Hello, this is a test message from Blue' }
  },
  {
    id: 'msg-2',
    details: {
      messageType: 'chat',
      senderId: 'user2',
      senderName: 'Red User',
      senderForce: 'red',
      turn: '1',
      phase: 'planning',
      timestamp: new Date().toISOString(),
      channel: 'blue-chat'
    },
    content: { text: 'Hello from Red team' }
  }
]

const mockUsers = [
  { id: 'user1', name: 'Blue User', force: 'blue', isOnline: true },
  { id: 'user2', name: 'Red User', force: 'red', isOnline: true },
  { id: 'user3', name: 'Offline User', force: 'green', isOnline: false }
]

const mockTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#f0f2f5',
    colorText: 'rgba(0, 0, 0, 0.88)'
  }
}

// Story metadata
const meta = {
  title: 'PlayerView/Rooms/RoomContent',
  component: RoomContentCore,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta<typeof RoomContentCore>

export default meta
type Story = StoryObj<typeof RoomContentCore>

// Stories
export const Default: Story = {
  args: {
    room: mockRoom,
    messages: mockMessages as GameMessage[],
    theme: mockTheme,
    canSubmit: true,
    sendMessage: (type, content) => console.log('Message sent:', { type, content }),
    infoModal: null,
    setInfoModal: () => {},
    users: mockUsers,
    presenceVisibility: { showOnlineOnly: true } as unknown as PresenceVisibility,
    currentUserForceId: 'blue',
    currentUserId: 'user1',
    isAdmin: false,
    getForce: (forceId: string) => Promise.resolve({
      id: forceId,
      name: forceId,
      color: forceId
    }) as Promise<ForceConfigType>
  }
}

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    canSubmit: false
  }
}

export const WithInfoModal: Story = {
  args: {
    ...Default.args,
    infoModal: {
      title: 'Modal title', 
      message: 'Modal message',
      type: 'info'
    }
  }
}

export const AdminView: Story = {
  args: {
    ...Default.args,
    isAdmin: true
  }
}
