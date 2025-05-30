import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { RoomType, GameMessage } from '../../../../types/rooms-d'
import { mockBackend } from '../../../../mockData/mockAdmin'

// Import the named export for the core component (not the wrapper)
import { MapContent } from './index'

// Define the meta export for the component
const meta = {
  title: 'PlayerView/Rooms/MapContent',
  component: MapContent,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta<typeof MapContent>

export default meta
type Story = StoryObj<typeof MapContent>

// Mock room data for the main map
const mainMapRoom: RoomType = {
  roomName: 'main-map',
  naturalName: 'Main Map',
  description: JSON.stringify({
    description: 'Main scenario map',
    presenceVisibility: 'all',
    specifics: {
      roomType: 'map',
      backdropUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  })
}

// Wrapper for the stories to provide a container with proper dimensions
const MapContentWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div style={{ 
    width: '100%', 
    height: '100vh',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }}>
    {children}
  </div>
)

// Main Map with data from main-map room
export const MainMapWithData: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The MapContent component displaying the main map with GeoJSON data'
      }
    }
  },
  render: () => {
    // Get messages from the main-map room
    const mainMapMessages = (mockBackend.chatrooms.find(room => room.id === 'main-map')?.dummyMessages || []) as GameMessage[]
    
    // Create a mock sendMessage function
    const mockSendMessage = (messageType: GameMessage['details']['messageType'], content: object) => {
      console.log('Mock sendMessage called with:', messageType, content)
    }
    
    return (
      <MapContentWrapper>
        <MapContent 
          room={mainMapRoom} 
          messages={mainMapMessages} 
          sendMessage={mockSendMessage}
        />
      </MapContentWrapper>
    )
  }
}

// Map with no data
export const EmptyMap: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The MapContent component with no map data'
      }
    }
  },
  render: () => {
    // Create a mock sendMessage function
    const mockSendMessage = (messageType: GameMessage['details']['messageType'], content: object) => {
      console.log('Mock sendMessage called with:', messageType, content)
    }
    
    return (
      <MapContentWrapper>
        <MapContent 
          room={mainMapRoom} 
          messages={[]} 
          sendMessage={mockSendMessage}
        />
      </MapContentWrapper>
    )
  }
}
