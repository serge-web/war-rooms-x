import type { Meta, StoryObj } from '@storybook/react'
import GameState from './index'
import { WargameProvider } from '../../../contexts/WargameProvider'

const meta: Meta<typeof GameState> = {
  title: 'PlayerView/GameState',
  component: GameState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <WargameProvider>
        <div style={{ width: '400px', height: '200px' }}>
          <Story />
        </div>
      </WargameProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof GameState>

export const Default: Story = {}

export const PlanningPhase: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: 5,
        currentPhase: 'Planning',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Coastal defense exercise',
      },
    },
  },
}

export const ActionPhase: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: 5,
        currentPhase: 'Action',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Coastal defense exercise',
      },
    },
  },
}

export const NoGameState: Story = {
  parameters: {
    wargame: {
      gameState: null,
      gameProperties: null,
    },
  },
}
