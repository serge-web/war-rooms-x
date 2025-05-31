import { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
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

// Wrapper component to manage message state
const MessageManager: React.FC<React.ComponentProps<typeof MapContent>> = (props) => {
  const [messages, setMessages] = useState<GameMessage[]>(props.messages || [])
  
  const sendMessage = (messageType: 'chat' | 'map' | 'form', content: object) => {
    const newMessage: GameMessage = {
      id: `msg-${Date.now()}`,
      details: {
        messageType,
        senderId: 'user1',
        senderName: 'Map User',
        senderForce: 'blue',
        turn: '1',
        phase: 'planning',
        timestamp: new Date().toISOString(),
        channel: props.room.roomName
      },
      content
    }
    
    setMessages(prev => [...prev, newMessage])
  }
  
  return (
    <MapContent 
      {...props} 
      messages={messages}
      sendMessage={sendMessage}
    />
  )
}

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
    
    return (
      <MapContentWrapper>
        <MessageManager 
          room={mainMapRoom} 
          messages={mainMapMessages}
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
  render: () => (
    <MapContentWrapper>
      <MessageManager 
        room={mainMapRoom} 
        messages={[]}
      />
    </MapContentWrapper>
  )
}

// Example of a story with a feature collection
export const WithFeatureCollection: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Map with a sample feature collection already added'
      }
    }
  },
  render: () => {
    const initialMessages: GameMessage[] = [
      {
        id: 'fc-1',
        details: {
          messageType: 'map',
          senderId: 'user1',
          senderName: 'Map User',
          senderForce: 'blue',
          turn: '1',
          phase: 'planning',
          timestamp: new Date().toISOString(),
          channel: 'main-map'
        },
        content: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Sample Point' },
              geometry: {
                type: 'Point',
                coordinates: [-0.09, 51.505]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Sample Line' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [-0.1, 51.5],
                  [-0.08, 51.5],
                  [-0.08, 51.51],
                  [-0.1, 51.51]
                ]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Sample Polygon' },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-0.12, 51.5],
                    [-0.1, 51.5],
                    [-0.1, 51.51],
                    [-0.12, 51.51],
                    [-0.12, 51.5]
                  ]
                ]
              }
            }
          ]
        }
      }
    ]
    
    return (
      <MapContentWrapper>
        <MessageManager 
          room={mainMapRoom} 
          messages={initialMessages}
        />
      </MapContentWrapper>
    )
  }
}
