import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import MapContent from '.'
import type { GameMessage, RoomType } from '../../../../types/rooms-d'
import { WargameContext } from '../../../../contexts/WargameContext'
import type { 
  WargameContextType, 
  GamePlayerDetails, 
  GameStateType, 
  GamePropertiesType, 
  MockId,
  ForceConfigType,
  UserConfigType
} from '../../../../types/wargame-d'
import { XMPPService } from '../../../../services/XMPPService'
import { DataProvider } from 'react-admin'
import { mockBackend } from '../../../../mockData/mockAdmin'

// Create a mock room with map configuration
const createMapRoom = (name: string): RoomType => ({
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
const mapRoom = createMapRoom('Map Room')

// Mock player details
const mockPlayerDetails: GamePlayerDetails = {
  id: 'player-1',
  role: 'Game Master',
  forceId: 'blue',
  forceName: 'Blue Force',
  color: '#1890ff'
}

// Mock game state
const mockGameState: GameStateType = {
  turn: '1',
  currentTime: '2023-01-01T12:00:00Z',
  currentPhase: 'Planning'
}

// Mock game properties
const mockGameProperties: GamePropertiesType = {
  name: 'Test Wargame',
  startTime: '2023-01-01T00:00:00Z',
  interval: '1h',
  turnType: 'Plan/Adjudicate' as const
}

// Mock XMPP service
class MockXMPPService extends XMPPService {
  async sendRoomMessage() {
    return { success: true, id: `msg-${Date.now()}`, error: undefined }
  }
}

// Wrapper component to provide required context
const WargameDecorator = (Story: React.ComponentType) => {
  const [xmppClient] = React.useState<XMPPService | null>(new MockXMPPService())
  const [raDataProvider] = React.useState<DataProvider | undefined>(undefined)
  const [mockPlayerId] = React.useState<MockId | null>({
    playerId: 'test-player-1',
    forceId: 'blue'
  })
  
  const getForce = React.useCallback(async (forceId: string): Promise<ForceConfigType> => ({
    type: 'force-config-type-v1' as const,
    id: forceId,
    name: `${forceId} Force`,
    color: '#1890ff'
  }), [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPlayerDetails = React.useCallback(async (_: string): Promise<UserConfigType | undefined> => ({
    type: 'user-config-type-v1' as const,
    name: 'Test User',
    forceId: 'blue'
  }), [])

  const nextTurn = React.useCallback(async () => {
    console.log('Next turn called')
  }, [])

  const contextValue: WargameContextType = {
    loggedIn: true,
    xmppClient,
    setXmppClient: () => {},
    raDataProvider,
    setRaDataProvider: () => {},
    mockPlayerId,
    setMockPlayerId: () => {},
    playerDetails: mockPlayerDetails,
    getForce,
    getPlayerDetails,
    gameProperties: mockGameProperties,
    gameState: mockGameState,
    nextTurn,
    rooms: []
  }

  return (
    <WargameContext.Provider value={contextValue}>
      <Story />
    </WargameContext.Provider>
  )
}

// Mock the useRoom hook
const mockUseRoom = (messages: GameMessage[] = []) => ({
  messages,
  users: [],
  theme: undefined,
  canSubmit: true,
  infoModal: null,
  clearInfoModal: () => {},
  sendMessage: async () => ({ success: true })
})

// Get map messages from mock admin data
const mapMessages = mockBackend.chatrooms.find((room) => room.id === 'main-map')?.dummyMessages

// Create a wrapper component that mocks useRoom
const MapContentWithMocks: React.FC<{ room: RoomType; messages: GameMessage[] }> = ({ room, messages }) => {
  // Mock the useRoom hook
  jest.spyOn(require('../useRoom'), 'useRoom').mockImplementation(() => mockUseRoom(messages))
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MapContent room={room} />
    </div>
  )
}

const meta = {
  title: 'PlayerView/Rooms/MapContent',
  component: MapContent,
  decorators: [WargameDecorator],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapContent>

export default meta
type Story = StoryObj<typeof meta>

export const EmptyMap: Story = {
  args: {
    room: mapRoom
  },
  render: (args) => <MapContentWithMocks {...args} messages={[]} />,
  parameters: {
    docs: {
      description: {
        story: 'A fresh map with no existing features.',
      },
    },
  },
}

export const WithMockData: Story = {
  args: {
    room: mapRoom
  },
  render: (args) => <MapContentWithMocks {...args} messages={mapMessages as GameMessage[]} />,
  parameters: {
    docs: {
      description: {
        story: 'Map with features loaded from mock admin data.',
      },
    },
  },
}
