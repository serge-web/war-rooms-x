import type { Meta, StoryObj } from '@storybook/react'
import type { RoomType, GameMessage } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import MapContent from '.'
import { WargameProvider } from '../../../../contexts/WargameProvider'

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

// Create a mock room instance
const mapRoom = createMapRoom('main-map')

// Mock implementation of useRoom
const mockUseRoom = (room: RoomType) => {
  // Get messages from the mock backend for the current room
  const mockMessages = room.roomName === 'main-map' 
    ? (mockBackend.chatrooms.find(r => r.id === 'main-map')?.dummyMessages as GameMessage[] || [])
    : []

  return {
    messages: mockMessages,
    users: [],
    theme: null,
    canSubmit: true,
    infoModal: null,
    clearInfoModal: () => {},
    sendMessage: async () => {},
    presenceVisibility: 'all' as const,
    setInfoModal: () => {}
  }
}

// Mock the useRoom hook
jest.mock('../../useRoom', () => ({
  useRoom: (room: RoomType) => mockUseRoom(room)
}))

// Create a wrapper component that provides the room context
const MapContentWithMocks = ({ room }: { room: RoomType }) => (
  <div style={{ width: '100%', height: '600px' }}>
    <WargameProvider>
      <MapContent room={room} />
    </WargameProvider>
  </div>
)

const meta = {
  title: 'PlayerView/Rooms/MapContent',
  component: MapContentWithMocks,
  parameters: {
    layout: 'fullscreen' as const
  }
} satisfies Meta<typeof MapContentWithMocks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    room: mapRoom
  },
  parameters: {
    layout: 'fullscreen',
  }
}

export const EmptyMap: Story = {
  args: {
    room: mapRoom
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
    room: mapRoom
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