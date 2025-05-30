import type { Meta, StoryObj } from '@storybook/react'
import type { RoomType, GameMessage } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import { WargameProvider } from '../../../../contexts/WargameProvider'
import MapContent from '.'
import type { FC } from 'react'

// Create a wrapper component that provides the mock data
const MockedMapContent = ({ room }: { room: RoomType }) => {
  // Mock implementation of useRoom
  const mockUseRoom = (room: RoomType) => ({
    messages: room.roomName === 'main-map' 
      ? (mockBackend.chatrooms.find(r => r.id === 'main-map')?.dummyMessages as GameMessage[] || [])
      : [],
    users: [],
    theme: null,
    canSubmit: true,
    infoModal: null,
    clearInfoModal: () => {},
    sendMessage: async () => {},
    presenceVisibility: 'all' as const,
    setInfoModal: () => {}
  })

  // Use the mock implementation
  const roomData = mockUseRoom(room)
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <WargameProvider>
        <MapContent room={room} {...roomData} />
      </WargameProvider>
    </div>
  )
}

// Create a mock room with map configuration
const createMapRoom = (name: string) => ({
  roomName: name,
  roomType: 'map',
  description: JSON.stringify({
    name,
    description: 'A map room',
    specifics: {
      roomType: 'map',
      backdropUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
  }),
})

const meta: Meta<typeof MockedMapContent> = {
  title: 'PlayerView/Rooms/MapContent',
  component: MockedMapContent as FC<{ room: RoomType }>,
  args: {
    room: createMapRoom('main-map')
  },
  parameters: {
    layout: 'fullscreen' as const
  }
}

type Story = StoryObj<typeof MockedMapContent>

export default meta

export const Default: Story = {
  args: {
    room: createMapRoom('main-map')
  }
}

export const WithMessages: Story = {
  args: {
    room: createMapRoom('main-map')
  }
}

export const WithCustomMap: Story = {
  args: {
    room: createMapRoom('custom-map')
  },
  parameters: {
    docs: {
      description: {
        story: 'A map with custom configuration.'
      }
    }
  }
}

export const EmptyMap: Story = {
  args: {
    room: createMapRoom('empty-map')
  },
  parameters: {
    docs: {
      description: {
        story: 'A map with no features or markers displayed.'
      }
    },
    layout: 'fullscreen'
  }
}

export const WithFeatures: Story = {
  args: {
    room: createMapRoom('main-map')
  },
  parameters: {
    docs: {
      description: {
        story: 'A map with sample features and markers from mock data.'
      }
    },
    layout: 'fullscreen'
  }
}