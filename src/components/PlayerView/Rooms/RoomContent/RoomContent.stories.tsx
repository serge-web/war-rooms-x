import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import RoomContent from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { ForceConfigType, GameStateType } from '../../../../types/wargame-d'
import { RoomType } from '../../../../types/rooms-d'
// Import mock data from mockAdmin
import { mockBackend } from '../../../../mockData/mockAdmin'

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

// Get users from mockBackend
const mockUsers = mockBackend.users

// Get mock messages from mockBackend
const blueRoomMessages = mockBackend.chatrooms.find(room => room.id === 'blue-chat')?.dummyMessages || []
const redRoomMessages = mockBackend.chatrooms.find(room => room.id === 'red-chat')?.dummyMessages || []
const greenRoomMessages = mockBackend.chatrooms.find(room => room.id === 'green-chat')?.dummyMessages || []
const umpireRoomMessages = mockBackend.chatrooms.find(room => room.id === 'umpire-chat')?.dummyMessages || []

// Directly use the mock data in the WargameContext

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

  // Create a typed game state
  const gameState: GameStateType = {
    turn: '1',
    currentPhase: 'planning',
    currentTime: new Date().toISOString()
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
    playerDetails: {
      id: 'current-user',
      role: 'player',
      forceId: 'red',
      forceName: 'Red Force',
      color: mockForceColors['red']
    },
    getForce: mockGetForce,
    gameProperties: null,
    gameState,
    nextTurn: async () => {}
  }

  return (
    <WargameContext.Provider value={wargameContextValue}>
      <div style={{ width: '800px', height: '600px', position: 'relative' }}>
        <Story />
      </div>
    </WargameContext.Provider>
  )
}

const meta: Meta<typeof RoomContent> = {
  title: 'PlayerView/Rooms/RoomContent',
  component: RoomContent,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  decorators: [WargameProviderDecorator]
}

export default meta
type Story = StoryObj<typeof RoomContent>

// Use mockUsers in console.log to avoid lint error
console.log('Available users for stories:', mockUsers)

// Blue Force Chat Room
export const BlueForceChat: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'blue-chat',
      naturalName: 'Blue Force Chat'
    }
  },
  decorators: [
    (Story) => {
      // Create a mock implementation of the getForce method
      const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
        return {
          type: 'force-config-type-v1',
          id: forceId,
          name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
          color: mockForceColors[forceId] || '#000000'
        }
      }

      // Create a typed game state
      const gameState: GameStateType = {
        turn: '1',
        currentPhase: 'planning',
        currentTime: new Date().toISOString()
      }

      // Mock WargameContext value with blue force player
      const wargameContextValue = {
        loggedIn: true,
        xmppClient: null,
        setXmppClient: () => {},
        raDataProvider: undefined,
        setRaDataProvider: () => {},
        mockPlayerId: null,
        setMockPlayerId: () => {},
        playerDetails: {
          id: 'blue-co',
          role: 'player',
          forceId: 'blue',
          forceName: 'Blue Force',
          color: mockForceColors['blue']
        },
        getForce: mockGetForce,
        gameProperties: null,
        gameState,
        nextTurn: async () => {}
      }

      // Mock hooks for this story
      jest.mock('../useRoom', () => ({
        useRoom: () => ({
          messages: blueRoomMessages,
          theme: {
            token: {
              colorPrimary: '#1890ff'
            }
          },
          canSubmit: true,
          sendMessage: () => {},
          error: null,
          clearError: () => {}
        })
      }))
      
      return (
        <WargameContext.Provider value={wargameContextValue}>
          <div style={{ width: '800px', height: '600px', position: 'relative' }}>
            <Story />
          </div>
        </WargameContext.Provider>
      )
    }
  ]
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
  decorators: [
    (Story) => {
      // Create a mock implementation of the getForce method
      const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
        return {
          type: 'force-config-type-v1',
          id: forceId,
          name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
          color: mockForceColors[forceId] || '#000000'
        }
      }

      // Create a typed game state
      const gameState: GameStateType = {
        turn: '1',
        currentPhase: 'planning',
        currentTime: new Date().toISOString()
      }

      // Mock WargameContext value with red force player
      const wargameContextValue = {
        loggedIn: true,
        xmppClient: null,
        setXmppClient: () => {},
        raDataProvider: undefined,
        setRaDataProvider: () => {},
        mockPlayerId: null,
        setMockPlayerId: () => {},
        playerDetails: {
          id: 'red-co',
          role: 'player',
          forceId: 'red',
          forceName: 'Red Force',
          color: mockForceColors['red']
        },
        getForce: mockGetForce,
        gameProperties: null,
        gameState,
        nextTurn: async () => {}
      }

      // Mock hooks for this story
      jest.mock('../useRoom', () => ({
        useRoom: () => ({
          messages: redRoomMessages,
          theme: {
            token: {
              colorPrimary: '#ff4d4f'
            }
          },
          canSubmit: true,
          sendMessage: () => {},
          error: null,
          clearError: () => {}
        })
      }))
      
      return (
        <WargameContext.Provider value={wargameContextValue}>
          <div style={{ width: '800px', height: '600px', position: 'relative' }}>
            <Story />
          </div>
        </WargameContext.Provider>
      )
    }
  ]
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
  decorators: [
    (Story) => {
      // Create a mock implementation of the getForce method
      const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
        return {
          type: 'force-config-type-v1',
          id: forceId,
          name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
          color: mockForceColors[forceId] || '#000000'
        }
      }

      // Create a typed game state
      const gameState: GameStateType = {
        turn: '1',
        currentPhase: 'planning',
        currentTime: new Date().toISOString()
      }

      // Mock WargameContext value with green force player
      const wargameContextValue = {
        loggedIn: true,
        xmppClient: null,
        setXmppClient: () => {},
        raDataProvider: undefined,
        setRaDataProvider: () => {},
        mockPlayerId: null,
        setMockPlayerId: () => {},
        playerDetails: {
          id: 'green-co',
          role: 'player',
          forceId: 'green',
          forceName: 'Green Force',
          color: mockForceColors['green']
        },
        getForce: mockGetForce,
        gameProperties: null,
        gameState,
        nextTurn: async () => {}
      }

      // Mock hooks for this story
      jest.mock('../useRoom', () => ({
        useRoom: () => ({
          messages: greenRoomMessages,
          theme: {
            token: {
              colorPrimary: '#52c41a'
            }
          },
          canSubmit: true,
          sendMessage: () => {},
          error: null,
          clearError: () => {}
        })
      }))
      
      return (
        <WargameContext.Provider value={wargameContextValue}>
          <div style={{ width: '800px', height: '600px', position: 'relative' }}>
            <Story />
          </div>
        </WargameContext.Provider>
      )
    }
  ]
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
  decorators: [
    (Story) => {
      // Create a mock implementation of the getForce method
      const mockGetForce = async (forceId: string): Promise<ForceConfigType> => {
        return {
          type: 'force-config-type-v1',
          id: forceId,
          name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
          color: mockForceColors[forceId] || '#000000'
        }
      }

      // Create a typed game state
      const gameState: GameStateType = {
        turn: '1',
        currentPhase: 'planning',
        currentTime: new Date().toISOString()
      }

      // Mock WargameContext value with umpire
      const wargameContextValue = {
        loggedIn: true,
        xmppClient: null,
        setXmppClient: () => {},
        raDataProvider: undefined,
        setRaDataProvider: () => {},
        mockPlayerId: null,
        setMockPlayerId: () => {},
        playerDetails: {
          id: 'admin',
          role: 'admin',
          forceId: 'umpire',
          forceName: 'Umpire',
          color: mockForceColors['umpire']
        },
        getForce: mockGetForce,
        gameProperties: null,
        gameState,
        nextTurn: async () => {}
      }

      // Mock hooks for this story
      jest.mock('../useRoom', () => ({
        useRoom: () => ({
          messages: umpireRoomMessages,
          theme: {
            token: {
              colorPrimary: '#722ed1'
            }
          },
          canSubmit: true,
          sendMessage: () => {},
          error: null,
          clearError: () => {}
        })
      }))
      
      return (
        <WargameContext.Provider value={wargameContextValue}>
          <div style={{ width: '800px', height: '600px', position: 'relative' }}>
            <Story />
          </div>
        </WargameContext.Provider>
      )
    }
  ]
}

// View with diverse forces
export const DiverseForces: Story = {
  args: {
    room: mockRoom
  },
  parameters: {
    userScenario: 'diverse',
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// View with some offline users
export const MixedOnlineStatus: Story = {
  args: {
    room: mockRoom
  },
  parameters: {
    userScenario: 'offline',
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Admin view with umpires-only visibility
export const AdminView: Story = {
  args: {
    room: mockRoom
  },
  parameters: {
    userScenario: 'online',
    visibilityConfig: 'umpires-only',
    currentUserForce: 'admin',
    isAdmin: true
  }
}

// Loading state
export const Loading: Story = {
  args: {
    room: mockRoom
  },
  parameters: {
    userScenario: 'loading',
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}

// Empty state (no users)
export const EmptyState: Story = {
  args: {
    room: mockRoom
  },
  parameters: {
    userScenario: 'empty',
    visibilityConfig: 'all',
    currentUserForce: 'red',
    isAdmin: false
  }
}
