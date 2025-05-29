import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import MapContent from '.'
import type { RoomType, MapRoomConfig } from '../../../../types/rooms-d'

// Helper to create a properly typed RoomType with MapRoomConfig
const createMapRoom = (name: string, config: Partial<MapRoomConfig> = {}): RoomType => ({
  roomName: name,
  description: JSON.stringify({
    name,
    description: 'A map room',
    specifics: {
      roomType: 'map',
      backdropUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ...config
    },
  }),
})

// Mock rooms with different configurations
const emptyMapRoom = createMapRoom('Empty Map')
const populatedMapRoom = createMapRoom('Populated Map')
const customBackdropRoom = createMapRoom('Custom Backdrop Map', {
  backdropUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
})

// Wrapper component to handle map state in Storybook
const MapContentWrapper: React.FC<{ room: RoomType }> = ({ room }) => (
  <div style={{ width: '100%', height: '600px' }}>
    <MapContent room={room} />
  </div>
)

const meta = {
  title: 'PlayerView/Rooms/MapContent',
  component: MapContent,
  parameters: {
    layout: 'fullscreen',
    // Mock the useRoom hook
    msw: {
      handlers: [
        // Add mock handlers if needed for API calls
      ],
    },
  },
  // Disable Chromatic for this story as it's interactive
  chromatic: { disableSnapshot: true },
} as Meta<typeof MapContent>

export default meta

type Story = StoryObj<typeof MapContent>

export const EmptyMap: Story = {
  render: () => <MapContentWrapper room={emptyMapRoom} />,
  parameters: {
    docs: {
      description: {
        story: 'A fresh map with no existing features. Users can start drawing on the map using the toolbar on the left.',
      },
    },
  },
}

export const WithInitialFeatures: Story = {
  render: () => <MapContentWrapper room={populatedMapRoom} />,
  parameters: {
    docs: {
      description: {
        story: 'Map with some initial features loaded. Users can modify existing features or add new ones.',
      },
    },
  },
}

export const WithCustomBackdrop: Story = {
  render: () => <MapContentWrapper room={customBackdropRoom} />,
  parameters: {
    docs: {
      description: {
        story: 'Map with a custom satellite imagery backdrop. Demonstrates how different map styles can be applied.',
      },
    },
  },
}

// Interactive map story
export const InteractiveMap: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
          Use the drawing tools on the left to add features to the map
        </div>
      </div>
      <div style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}>
        <MapContent room={emptyMapRoom} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive map that allows you to test the drawing functionality directly in Storybook.',
      },
    },
  },
}
