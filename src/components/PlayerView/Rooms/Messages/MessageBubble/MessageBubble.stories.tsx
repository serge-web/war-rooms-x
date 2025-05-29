import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import MessageBubble from './index'
import { Template } from '../../../../../types/rooms-d'
import { WargameContext } from '../../../../../contexts/WargameContext'
import { WargameContextType } from '../../../../../types/wargame-d'
import { LINEAR_TURNS } from '../../../../../types/constants'

// Mock WargameContext
const mockWargameContext: WargameContextType = {
  loggedIn: true,
  xmppClient: null,
  setXmppClient: () => {},
  raDataProvider: undefined,
  setRaDataProvider: () => {},
  mockPlayerId: { playerId: 'user-1', forceId: 'blue' },
  setMockPlayerId: () => {},
  playerDetails: {
    id: 'user-1',
    role: 'player',
    forceId: 'blue',
    forceName: 'Blue Force'
  },
  getForce: async (forceId: string) => ({
    type: 'force-config-type-v1',
    id: forceId,
    name: `${forceId} Force`,
    color: forceId === 'blue' ? '#1890ff' : forceId === 'red' ? '#f5222d' : '#d9d9d9',
    objectives: 'Complete the mission objectives'
  }),
  getPlayerDetails: async () => ({
    type: 'user-config-type-v1',
    name: 'Test User',
    forceId: 'blue'
  }),
  gameProperties: {
    name: 'Test Game',
    startTime: new Date().toISOString(),
    interval: 'PT1H',
    turnType: LINEAR_TURNS,
    description: 'Test game description'
  },
  gameState: {
    turn: '1',
    currentTime: new Date().toISOString(),
    currentPhase: 'planning'
  },
  nextTurn: async () => {},
  rooms: []
}

// Wrapper component to provide mock context
const MockWargameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <WargameContext.Provider value={mockWargameContext}>{children}</WargameContext.Provider>
}

const meta: Meta<typeof MessageBubble> = {
  title: 'Rooms/Messages/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockWargameProvider>
        <div style={{ padding: '20px', maxWidth: '600px' }}>
          <Story />
        </div>
      </MockWargameProvider>
    )
  ],
  argTypes: {
    isSelf: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof MessageBubble>

const mockTemplates: Template[] = [
  {
    id: 'template-1',
    schema: {
      title: 'Standard Report',
      type: 'object',
      properties: {
        status: { type: 'string', title: 'Status' },
        notes: { type: 'string', title: 'Notes' }
      }
    },
    uiSchema: {
      'ui:order': ['status', 'notes']
    }
  }
]

export const SelfMessage: Story = {
  args: {
    isSelf: true,
    templates: [],
    message: {
      id: '1',
      details: {
        senderId: 'user-1',
        senderName: 'You',
        senderForce: 'blue',
        messageType: 'chat',
        timestamp: '10:30 AM',
        turn: '1',
        phase: 'planning',
        channel: 'room-1'
      },
      content: { value: 'This is a message from yourself' }
    }
  }
}

export const OtherUserMessageRed: Story = {
  args: {
    isSelf: false,
    templates: [],
    message: {
      id: '2',
      details: {
        senderId: 'user-2',
        senderName: 'Team Member',
        senderForce: 'red',
        messageType: 'chat',
        timestamp: '10:31 AM',
        turn: '1',
        phase: 'planning',
        channel: 'room-1'
      },
      content: { value: 'This is a message from a red force user' }
    }
  }
}

export const OtherUserMessageBlue: Story = {
  args: {
    isSelf: false,
    templates: [],
    message: {
      id: '2',
      details: {
        senderId: 'user-2',
        senderName: 'Team Member',
        senderForce: 'blue',
        messageType: 'chat',
        timestamp: '10:31 AM',
        turn: '1',
        phase: 'planning',
        channel: 'room-1'
      },
      content: { value: 'This is a message from another blue force user' }
    }
  }
}

export const SelfFormMessage: Story = {
  args: {
    isSelf: true,
    templates: mockTemplates,
    message: {
      id: '3',
      details: {
        senderId: 'system-1',
        senderName: 'System',
        senderForce: 'white',
        messageType: 'form',
        timestamp: '10:32 AM',
        turn: '1',
        phase: 'planning',
        channel: 'room-1'
      },
      content: {
        templateId: 'template-1',
        data: {
          status: 'Active',
          notes: 'All systems operational'
        }
      }
    }
  }
}


export const OtherFormMessage: Story = {
  args: {
    isSelf: false,
    templates: mockTemplates,
    message: {
      id: '3',
      details: {
        senderId: 'system-1',
        senderName: 'System',
        senderForce: 'white',
        messageType: 'form',
        timestamp: '10:32 AM',
        turn: '1',
        phase: 'planning',
        channel: 'room-1'
      },
      content: {
        templateId: 'template-1',
        data: {
          status: 'Active',
          notes: 'All systems operational'
        }
      }
    }
  }
}
