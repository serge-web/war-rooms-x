import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import SimpleFormContent from './index'
import { WargameContext } from '../../../../contexts/WargameContext'
import { RoomType, GameMessage, Template } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import { ForceConfigType, GameStateType } from '../../../../types/wargame-d'
import localforage from 'localforage'
import { prefixKey } from '../../../../types/constants'

// Define the meta export for the component
const meta = {
  title: 'PlayerView/Rooms/SimpleFormContent',
  component: SimpleFormContent,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SimpleFormContent>

export default meta
type Story = StoryObj<typeof SimpleFormContent>

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

// Mock templates for forms
const mockTemplates: Template[] = [
  {
    id: 'sitrep-template',
    schema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          title: 'Location'
        },
        activity: {
          type: 'string',
          title: 'Activity'
        },
        status: {
          type: 'string',
          title: 'Status',
          enum: ['Green', 'Amber', 'Red']
        }
      },
      required: ['location', 'activity', 'status']
    },
    uiSchema: {
      'ui:order': ['location', 'activity', 'status']
    }
  },
  {
    id: 'contact-report',
    schema: {
      type: 'object',
      properties: {
        contactType: {
          type: 'string',
          title: 'Contact Type',
          enum: ['Air', 'Surface', 'Subsurface', 'Land']
        },
        bearing: {
          type: 'number',
          title: 'Bearing'
        },
        range: {
          type: 'number',
          title: 'Range (nm)'
        },
        description: {
          type: 'string',
          title: 'Description'
        }
      },
      required: ['contactType', 'bearing', 'range']
    },
    uiSchema: {
      'ui:order': ['contactType', 'bearing', 'range', 'description']
    }
  }
]

// Mock room data with template IDs
const mockRoom: RoomType = {
  roomName: 'test-form-room',
  naturalName: 'Test Form Room',
  description: JSON.stringify({
    theme: {
      token: {
        colorPrimary: '#1890ff'
      }
    },
    description: 'A test form room for storybook',
    specifics: {
      roomType: 'form',
      templateIds: ['sitrep-template', 'contact-report']
    }
  })
}

// Initialize mock data for IndexedDB
const initMockData = async (roomName: string, forceId: string) => {
  // Create mock users for this force
  const mockUsers = mockBackend.users
    .filter(user => user.name.toLowerCase().includes(forceId))
    .map(user => ({
      jid: user.id,
      name: user.name,
      force: forceId,
      isOnline: true
    }))

  // Add some users from other forces for testing presence visibility
  if (forceId !== 'umpire') {
    const umpireUsers = mockBackend.users
      .filter(user => user.name.toLowerCase().includes('umpire'))
      .map(user => ({
        jid: user.id,
        name: user.name,
        force: 'umpire',
        isOnline: true
      }))
    mockUsers.push(...umpireUsers)
  }

  // Get mock messages for this force
  let mockMessages: GameMessage[] = []
  const chatroom = mockBackend.chatrooms.find(room => room.id === `${forceId}-forms`)
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
  await localforage.setItem(`${prefixKey}templates`, mockTemplates)
  console.log(`Mock data initialized for ${roomName} with ${mockUsers.length} users and ${mockMessages.length} messages`)
}

// Create a decorator for each force
const createForceDecorator = (forceId: string, presenceVisibility: 'all' | 'umpires-only' = 'all') => {
  return (Story: React.ComponentType, { args }: { args: { room: RoomType } }) => {
    // Initialize mock data for IndexedDB when the component mounts
    useEffect(() => {
      // Using forceId from closure, not needed in deps array
      initMockData(args.room.roomName, forceId)
      
      // Update room description with presence visibility setting
      const roomDesc = JSON.parse(args.room.description || '{}')
      roomDesc.presenceVisibility = presenceVisibility
      args.room.description = JSON.stringify(roomDesc)
    }, [args.room.roomName, args.room])

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
        role: forceId === 'umpire' ? 'umpire' : (forceId === 'admin' ? 'admin' : 'player'),
        forceId,
        forceName: `${forceId.charAt(0).toUpperCase() + forceId.slice(1)} Force`,
        color: mockForceColors[forceId]
      },
      getForce: mockGetForce,
      gameProperties: null,
      gameState,
      nextTurn: async () => {}
    }

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

// Blue Force Form Room
export const BlueForceForm: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'blue-forms',
      naturalName: 'Blue Force Forms'
    }
  },
  decorators: [createForceDecorator('blue')]
}

// Red Force Form Room
export const RedForceForm: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'red-forms',
      naturalName: 'Red Force Forms'
    }
  },
  decorators: [createForceDecorator('red')]
}

// Umpire Form Room with all users visible
export const UmpireFormAllVisible: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'umpire-forms-all',
      naturalName: 'Umpire Forms (All Visible)'
    }
  },
  decorators: [createForceDecorator('umpire', 'all')]
}

// Umpire Form Room with only umpires visible
export const UmpireFormUmpiresOnly: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'umpire-forms-restricted',
      naturalName: 'Umpire Forms (Umpires Only)'
    }
  },
  decorators: [createForceDecorator('umpire', 'umpires-only')]
}

// Admin view with all users visible
export const AdminView: Story = {
  args: {
    room: {
      ...mockRoom,
      roomName: 'admin-forms',
      naturalName: 'Admin Forms'
    }
  },
  decorators: [createForceDecorator('admin')]
}
