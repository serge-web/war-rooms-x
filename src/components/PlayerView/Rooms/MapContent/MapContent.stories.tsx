import React, { createContext, ReactNode, useState, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { RoomType, MessageDetails, GameMessage, OnlineUser, UserInfo } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'
import MapContent from '.'
import type { GameStateType, WargameContextType } from '../../../../types/wargame-d'

// Create a mock WargameContext
const WargameContext = createContext<WargameContextType | null>(null)

// Create a mock room with map configuration
const createMapRoom = (name: string) => ({
  roomName: name,
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

// Define the context type for the mock room
interface MockRoomContextType {
  messages: GameMessage[]
  users: OnlineUser[]
  theme: null
  canSubmit: boolean
  infoModal: UserInfo | null
  clearInfoModal: () => void
  sendMessage: (messageType: MessageDetails['messageType'], content: object) => Promise<void>
  presenceVisibility: 'all' | 'force' | 'none'
  setInfoModal: (info: UserInfo | null) => void
}

// Create a mock context with default values
const MockRoomContext = createContext<MockRoomContextType | undefined>(undefined)

// Create a provider component that will wrap our stories
const MockRoomProvider: React.FC<{room: RoomType, children: ReactNode}> = ({ room, children }) => {
  // Get messages from the mock backend for the 'main-map' room
  const mockMessages = useMemo(() => 
    room.roomName === 'main-map' 
      ? (mockBackend.chatrooms.find(r => r.id === 'main-map')?.dummyMessages as GameMessage[] || [])
      : [],
    [room.roomName]
  )

  const [infoModal, setInfoModal] = useState<UserInfo | null>(null)
  
  const value = {
    messages: mockMessages,
    users: [],
    theme: null,
    canSubmit: true,
    infoModal,
    clearInfoModal: () => setInfoModal(null),
    sendMessage: async () => {},
    presenceVisibility: 'all' as const,
    setInfoModal
  }

  return (
    <MockRoomContext.Provider value={value}>
      {children}
    </MockRoomContext.Provider>
  )
}

// Mock WargameContext
const mockWargameContext: WargameContextType = {
  loggedIn: true,
  xmppClient: null,
  setXmppClient: () => {},
  raDataProvider: undefined,
  setRaDataProvider: () => {},
  mockPlayerId: null,
  setMockPlayerId: () => {},
  playerDetails: {
    id: 'test-user',
    role: 'player',
    forceId: 'blue',
    forceName: 'Blue Force',
    forceObjectives: 'Test objectives',
    color: '#00f'
  },
  getForce: async (forceId: string) => ({
    type: 'force-config-type-v1',
    id: forceId,
    name: forceId === 'blue' ? 'Blue Force' : 'Unknown Force',
    objectives: 'Test objectives',
    color: forceId === 'blue' ? '#00f' : '#000'
  }),
  getPlayerDetails: async () => ({
    type: 'user-config-type-v1',
    name: 'Test User',
    forceId: 'blue'
  }),
  gameProperties: {
    name: 'Test Game',
    startTime: new Date().toISOString(),
    interval: '3600',
    turnType: 'Linear',
    playerTheme: {},
    adminTheme: {}
  },
  gameState: {
    turn: '1',
    currentTime: new Date().toISOString(),
    currentPhase: 'planning'
  } as GameStateType,
  nextTurn: async () => {},
  rooms: []
}

// Import the actual WargameProvider
import { WargameProvider } from '../../../../contexts/WargameProvider'

// Create a wrapper component that provides all necessary contexts
const MapContentWithMocks: React.FC<{ room: RoomType }> = ({ room }) => {
  // Create a wrapper that provides the mock context
  const MockWargameProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
    <WargameContext.Provider value={mockWargameContext}>
      {children}
    </WargameContext.Provider>
  )

  // Use the actual WargameProvider with our mock implementation
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <WargameProvider>
        <MockWargameProvider>
          <MockRoomProvider room={room}>
            <MapContent room={room} />
          </MockRoomProvider>
        </MockWargameProvider>
      </WargameProvider>
    </div>
  )
}

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