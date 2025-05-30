import { Meta, StoryObj } from '@storybook/react'
import { SimpleFormContentCore } from './index'
import { RoomType, OnlineUser, Template } from '../../../../types/rooms-d'
import { ForceConfigType } from '../../../../types/wargame-d'

// Mock data
const mockForceColors: Record<string, string> = {
  'blue': '#1890ff',
  'red': '#f5222d',
  'umpire': '#722ed1',
  'green': '#52c41a',
  'yellow': '#faad14',
  'admin': '#262626'
}

// Mock getForce function
const mockGetForce = async (forceId: string): Promise<ForceConfigType> => ({
  type: 'force-config-type-v1',
  id: forceId,
  name: forceId.charAt(0).toUpperCase() + forceId.slice(1),
  color: mockForceColors[forceId] || '#000000',
  objectives: 'Complete mission objectives'
})

// Mock users for presence
const mockUsers: OnlineUser[] = [
  { id: 'user1', name: 'Blue Leader', force: 'blue', isOnline: true },
  { id: 'user2', name: 'Blue 2', force: 'blue', isOnline: true },
  { id: 'user3', name: 'Red Leader', force: 'red', isOnline: true },
  { id: 'ump1', name: 'Umpire', force: 'umpire', isOnline: true }
]

// Mock room data
const mockRoom: RoomType = {
  roomName: 'test-form-room',
  description: JSON.stringify({
    theme: {
      token: {
        colorPrimary: '#1890ff'
      }
    },
    specifics: {
      roomType: 'form',
      templateIds: ['sitrep-template']
    },
    presenceVisibility: 'all'
  })
}

// Mock form template
const mockTemplates = [
  {
    id: 'sitrep-template',
    schema: {
      type: 'object',
      properties: {
        location: { type: 'string', title: 'Location' },
        activity: { type: 'string', title: 'Activity' },
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
  }
]

const meta = {
  title: 'PlayerView/Rooms/SimpleFormContent',
  component: SimpleFormContentCore,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof SimpleFormContentCore>

export default meta
type Story = StoryObj<typeof SimpleFormContentCore>

// Default story with empty form
export const Default: Story = {
  args: {
    room: mockRoom,
    messages: [],
    theme: {},
    canSubmit: true,
    sendMessage: (messageType, content) => {
      console.log('Message sent:', { messageType, content })
    },
    infoModal: null,
    setInfoModal: () => {},
    users: mockUsers,
    presenceVisibility: 'all',
    playerDetails: {
      id: 'user1',
      forceId: 'blue',
      role: 'player'
    },
    templates: mockTemplates as Template[],
    getForce: mockGetForce
  }
}

// Story with existing message
export const WithMessage: Story = {
  args: {
    ...Default.args,
    messages: [
      {
        id: 'msg1',
        details: {
          messageType: 'form',
          senderId: 'user1',
          senderName: 'Blue Leader',
          senderForce: 'blue',
          turn: '1',
          phase: 'planning',
          timestamp: new Date().toISOString(),
          channel: 'test-form-room'
        },
        content: {
          templateId: 'sitrep-template',
          data: {
            location: 'Grid 123456',
            activity: 'Patrolling sector',
            status: 'Green'
          }
        }
      }
    ]
  }
}

// Umpire view with all users visible
export const UmpireView: Story = {
  args: {
    ...Default.args,
    playerDetails: {
      id: 'ump1',
      forceId: 'umpire',
      role: 'umpire'
    }
  }
}

// Room with no templates configured
export const NoTemplates: Story = {
  args: {
    ...Default.args,
    room: {
      ...mockRoom,
      description: JSON.stringify({
        ...JSON.parse(mockRoom.description || '{}'),
        specifics: {
          ...JSON.parse(mockRoom.description || '{}').specifics,
          templateIds: []
        }
      })
    },
    templates: []
  }
}
