import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import RoomContent from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { RoomType } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import { ForceConfigType, GameStateType } from '../../../../types/wargame-d'

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
  'red': '#ff4d4f',
  'blue': '#1890ff',
  'umpire': '#722ed1',
  'green': '#52c41a',
  'yellow': '#faad14',
  'purple': '#722ed1',
  'admin': '#262626'
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

// Get mock messages from mockBackend for each force
const mockMessages = {
  blue: mockBackend.chatrooms.find(room => room.id === 'blue-chat')?.dummyMessages || [],
  red: mockBackend.chatrooms.find(room => room.id === 'red-chat')?.dummyMessages || [],
  green: mockBackend.chatrooms.find(room => room.id === 'green-chat')?.dummyMessages || [],
  umpire: mockBackend.chatrooms.find(room => room.id === 'umpire-chat')?.dummyMessages || []
}

// Get mock users for room presence
const mockRoomUsers = {
  blue: mockBackend.users.filter(user => user.name.toLowerCase().includes('blue')),
  red: mockBackend.users.filter(user => user.name.toLowerCase().includes('red')),
  green: mockBackend.users.filter(user => user.name.toLowerCase().includes('green')),
  umpire: mockBackend.users.filter(user => user.name.toLowerCase().includes('umpire')),
  logs: mockBackend.users.filter(user => user.name.toLowerCase().includes('logs')),
  all: mockBackend.users
}

// Create a WargameContext decorator for each force
const createForceDecorator = (forceId: string) => {
  return (Story: React.ComponentType) => {
    // Create a mock implementation of the getForce method
    const mockGetForce = async (id: string): Promise<ForceConfigType> => {
      return {
        type: 'force-config-type-v1',
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        color: mockForceColors[id] || '#000000'
      }
    }

    // Create a typed game state
    const gameState: GameStateType = {
      turn: '1',
      currentPhase: 'planning',
      currentTime: new Date().toISOString()
    }
    
    // Get the appropriate users for this force's room
    const roomUsers = mockRoomUsers[forceId as keyof typeof mockRoomUsers] || []
    
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
      gameProperties: null,
      gameState,
      nextTurn: async () => {}
    }

    // Create a mock room context with messages and users
    const mockRoomContext = {
      messages: mockMessages[forceId as keyof typeof mockMessages],
      users: roomUsers,
      theme: {
        token: {
          colorPrimary: mockForceColors[forceId] || '#000000'
        }
      },
      canSubmit: true,
      sendMessage: () => {},
      error: null,
      clearError: () => {}
    }

    // Add the room context to the WargameContext
    const contextWithRoom = {
      ...wargameContextValue,
      roomData: mockRoomContext
    }

    return (
      <WargameContext.Provider value={contextWithRoom}>
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


// Umpire Chat Room
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