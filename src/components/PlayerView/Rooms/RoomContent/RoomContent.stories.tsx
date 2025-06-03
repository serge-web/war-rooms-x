import { Meta, StoryObj } from '@storybook/react'
import { RoomContentCore, type RoomContentCoreProps } from './index'
import { GameMessage, type RoomType } from '../../../../types/rooms-d'
import { ThemeConfig } from 'antd'
import { ForceConfigType } from '../../../../types/wargame-d'
import { useState } from 'react'

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

const mockMessages: GameMessage[] = [
  {
    id: 'msg-1',
    details: {
      messageType: 'chat' as const,
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
      messageType: 'chat' as const,
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
type CommonRenderProps = Omit<RoomContentCoreProps, 'messages' | 'sendMessage'> 

const CommonRender = (args: CommonRenderProps) => {
  const [messages, setMessages] = useState<GameMessage[]>([...mockMessages])
  
  const sendMessage = (type: 'chat' | 'map' | 'form', content: { value: string } | object) => {
    // For this story, we only handle chat messages
    if (type !== 'chat') return
    
    const messageContent = 'value' in content ? content : { value: 'Empty message' }
    const newMessage: GameMessage = {
      id: `msg-${Date.now()}`,
      details: {
        messageType: 'chat',
        senderId: 'user1', // current user
        senderName: 'You',
        senderForce: 'blue',
        turn: '1',
        phase: 'planning',
        timestamp: new Date().toISOString(),
        channel: 'blue-chat'
      },
      content: messageContent
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoomContentCore 
        {...args} 
        room={mockRoom}
        messages={messages} 
        sendMessage={sendMessage}
        theme={mockTheme}
        canSubmit={true}
        infoModal={null}
        setInfoModal={() => {}}
        users={mockUsers}
        presenceVisibility={"all" as const}
        currentUserForceId="blue"
        currentUserId="user1"
        isAdmin={false}
        getForce={async (forceId: string): Promise<ForceConfigType> => ({
          id: forceId,
          name: forceId,
          color: forceId,
          type: 'force-config-type-v1'
        })}
      />
    </div>
  )
}

const commonArgs = {
  canSubmit: true,
  infoModal: null,
  setInfoModal: () => {},
  users: mockUsers,
  presenceVisibility: 'all' as const,
  currentUserForceId: 'blue',
  currentUserId: 'user1',
  isAdmin: false,
  getForce: (forceId: string) => Promise.resolve({
    id: forceId,
    name: forceId,
    color: forceId
  }) as Promise<ForceConfigType>
}

type RoomContentStory = StoryObj<typeof RoomContentCore>

const Template: RoomContentStory = {
  render: (args) => <CommonRender {...args} />
}

export const Default: RoomContentStory = {
  ...Template,
  args: {
    ...commonArgs,
    room: mockRoom,
    theme: mockTheme,
    messages: mockMessages, // Initial messages, will be overridden by the state
    sendMessage: (type, content) => console.log('Message sent:', type, content)
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
