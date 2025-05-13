import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import RoomContent from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { RoomType, GameMessage } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import { ForceConfigType, GameStateType, UserConfigType } from '../../../../types/wargame-d'
import localforage from 'localforage'
import { prefixKey } from '../../../../types/constants'
import { RUser } from '../../../AdminView/raTypes-d'

// Define the meta export for the component
const meta = {
  title: 'PlayerView/Rooms/RoomContent',
  component: RoomContent,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof RoomContent>

export default meta
type Story = StoryObj<typeof RoomContent>

// Mock force colors for the Storybook
const mockForceColors: Record<string, string> = {
  'blue': '#1890ff',
  'red': '#f5222d',
  'umpire': '#722ed1',
  'green': '#52c41a',
  'yellow': '#faad14',
  'purple': '#722ed1',
  'admin': '#262626',
  'logs': '#8c8c8c'
}

// Mock room data
const mockRoom: RoomType = {
  roomName: 'test-room',
  naturalName: 'Test Room',
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

// Initialize mock data for IndexedDB
const initMockData = async (roomName: string, forceId: string) => {
  // Create mock users for this force
  const mockUsers = mockBackend.users
    .filter(user => forceId === 'ALL' || user.name.toLowerCase().includes(forceId))
    .map(user => ({
      jid: user.id,
      name: user.name,
      force: forceId
    }))

  // Get mock messages for this force
  let mockMessages: GameMessage[] = []
  const chatroom = mockBackend.chatrooms.find(room => room.id === `${forceId}-chat`)
  if (chatroom && chatroom.dummyMessages) {
    mockMessages = chatroom.dummyMessages as GameMessage[]
  }

  // Create a mock room with users and messages
  const mockChatrooms = [
    {
      id: roomName,
      name: roomName,
      presenceConfig: 'all',
      dummyUsers: mockUsers,
      dummyMessages: mockMessages
    }
  ]

  // Store in IndexedDB
  await localforage.setItem(`${prefixKey}chatrooms`, mockChatrooms)
  console.log(`Mock data initialized for ${roomName} with ${mockUsers.length} users and ${mockMessages.length} messages`)
}

// Create a decorator for each force
const createForceDecorator = (forceId: string | 'ALL') => {
  return (Story: React.ComponentType, { args }: { args: { room: RoomType } }) => {
    // Initialize mock data for IndexedDB when the component mounts
    useEffect(() => {
      // Using forceId from closure, not needed in deps array
      initMockData(args.room.roomName, forceId)
    }, [args.room.roomName])

    // Create a mock implementation of the getForce method
    const mockGetForce = async (id: string): Promise<ForceConfigType> => {
      return {
        type: 'force-config-type-v1',
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        color: mockForceColors[id] || '#000000'
      }
    }

    const mockGetPlayerDetails = async (userId: string): Promise<UserConfigType | undefined> => {
      const details = mockBackend.users.find((u: RUser) => u.id === userId)
      if (!details) {
        return undefined
      }
      return {
        type: 'user-config-type-v1',
        name: details.name,
        forceId: details.force
      }
    }

    // Create a typed game state
    const gameState: GameStateType = {
      turn: '1',
      currentPhase: 'planning',
      currentTime: new Date().toISOString()
    }
    
    // Mock WargameContext value with the appropriate force player
    const wargameContextValue = {
      loggedIn: true,
      xmppClient: null,
      setXmppClient: () => {},
      raDataProvider: undefined,
      setRaDataProvider: () => {},
      mockPlayerId: null,
      setMockPlayerId: () => {},
      playerDetails: {
        id: `${forceId}-co`,
        role: forceId === 'umpire' ? 'umpire' : 'player',
        forceId,
        forceName: `${forceId.charAt(0).toUpperCase() + forceId.slice(1)} Force`,
        color: mockForceColors[forceId]
      },
      getForce: mockGetForce,
      getPlayerDetails: mockGetPlayerDetails,
      gameProperties: null,
      gameState,
      nextTurn: async () => {}
    }

    console.log('context', wargameContextValue)

    return (
      <WargameContext.Provider value={wargameContextValue}>
        <div style={{ 
          width: '800px', 
          height: '600px', 
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Story />
        </div>
      </WargameContext.Provider>
    )
  }
}

// Blue Force Chat Room
export const BlueForceChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'blue-chat',
      naturalName: 'Blue Force Chat'
    }
  },
  decorators: [createForceDecorator('blue')]
}

// Red Force Chat Room
export const RedForceChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'red-chat',
      naturalName: 'Red Force Chat'
    }
  },
  decorators: [createForceDecorator('red')]
}

// Green Force Chat Room
export const GreenForceChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'green-chat',
      naturalName: 'Green Force Chat'
    }
  },
  decorators: [createForceDecorator('green')]
}

// Umpire Chat Room
export const UmpireChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'umpire-chat',
      naturalName: 'Umpire Chat'
    }
  },
  decorators: [createForceDecorator('umpire')]
}

// Logs Chat Room
export const LogsChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'logs-chat',
      naturalName: 'Logs Chat'
    }
  },
  decorators: [createForceDecorator('logs')]
}

// Chat Room with lots of users
export const ManyUsers: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'many-users',
      naturalName: 'Many Users'
    }
  },
  decorators: [createForceDecorator('ALL')]
}
