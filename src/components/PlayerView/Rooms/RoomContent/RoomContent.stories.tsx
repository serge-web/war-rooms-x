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
    content: { value: 'Hello, this is a test message from Blue' }
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
    content: { value: 'Hello from Red team' }
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

// Common args for all stories
const commonArgs = {
  messages: mockMessages as GameMessage[],
  canSubmit: true,
  sendMessage: (type: string, content: object) => console.log('Message sent:', { type, content }),
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

export const Default: Story = {
  args: {
    ...commonArgs,
    room: mockRoom,
    theme: mockTheme
  }
}

// Custom theme configuration with serif font
const customTheme: ThemeConfig = {
  token: {
    colorPrimary: '#722ed1',
    colorBgContainer: '#f9f0ff',
    colorText: '#1f1f1f',
    colorBorder: '#d3adf7',
    colorPrimaryBg: '#f9f0ff',
    fontFamily: `'Georgia', 'Times New Roman', serif`,
    fontSize: 16,
    borderRadius: 8,
    lineHeight: 1.6
  },
  components: {
    Button: {
      primaryColor: '#fff',
      borderRadius: 20,
      fontSize: 14,
      fontWeight: 'bold',
      paddingBlock: 8,
      paddingInline: 20
    },
    Input: {
      activeBorderColor: '#9254de',
      hoverBorderColor: '#b37feb',
      activeShadow: '0 0 0 2px rgba(114, 46, 209, 0.2)',
      borderRadius: 8,
      paddingBlock: 10,
      paddingInline: 14
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    Typography: {
      fontFamily: `'Georgia', 'Times New Roman', serif`
    }
  }
}

const customThemedRoom: RoomType = {
  roomName: 'custom-theme-chat',
  naturalName: 'Custom Theme Chat',
  description: JSON.stringify({
    theme: customTheme,
    description: 'A chat room with a custom purple theme',
    specifics: {
      roomType: 'chat'
    }
  })
}

export const WithCustomTheme: Story = {
  args: {
    ...commonArgs,
    room: customThemedRoom,
    theme: customTheme
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
