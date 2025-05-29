import type { Meta, StoryObj } from '@storybook/react'
import MessageBubble from './index'
import { Template } from '../../../../../types/rooms-d'

const meta: Meta<typeof MessageBubble> = {
  title: 'Rooms/Messages/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
  argTypes: {
    isSelf: { control: 'boolean' },
  },
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

export const OtherUserMessage: Story = {
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
      content: { value: 'This is a message from another user' }
    }
  }
}

export const FormMessage: Story = {
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
