import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Button, Space } from 'antd'
import GameState, { GameStateProps } from './index'
import { GameStateType, GamePropertiesType } from '../../../../src/types/wargame-d'

// Mock data for different states
const mockGameProperties: GamePropertiesType = {
  name: 'Operation Desert Storm',
  description: 'A test wargame scenario',
  turnType: 'Linear',
  interval: 'PT1H', // 1 hour
  startTime: new Date().toISOString()
}

const mockGameState: GameStateType = {
  turn: '5',
  currentPhase: 'Action',
  currentTime: new Date().toISOString()
}

// Template for stories
const Template = (args: GameStateProps) => {
  const [gameState, setGameState] = useState<GameStateType | null>(args.gameState)
  const [gameProperties, setGameProperties] = useState<GamePropertiesType | null>(args.gameProperties)

  const handleNextTurn = () => {
    if (!gameState) return
    
    setGameState(prev => ({
      ...prev!,
      turn: prev!.turn + 1,
      currentPhase: prev!.currentPhase === 'Planning' ? 'Action' : 'Planning',
      currentTime: new Date().toISOString(),
      phaseStartTime: new Date().toISOString(),
      turnEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    }))
  }

  return (
    <div style={{ maxWidth: '400px' }}>
      <GameState 
        gameState={gameState}
        gameProperties={gameProperties}
        onNextTurn={() => handleNextTurn()}
      />
      
      <Space direction="vertical" style={{ marginTop: '1rem' }}>
        <div>
          <strong>Current State:</strong> Turn {gameState?.turn || 'N/A'}, Phase: {gameState?.currentPhase || 'N/A'}
        </div>
        <Space>
          <Button 
            type="primary" 
            onClick={handleNextTurn}
            disabled={!gameState}
          >
            Next Turn
          </Button>
          <Button 
            onClick={() => {
              setGameState(mockGameState)
              setGameProperties(mockGameProperties)
            }}
          >
            Reset State
          </Button>
        </Space>
      </Space>
    </div>
  )
}

const meta: Meta<typeof GameState> = {
  title: 'PlayerView/GameState',
  component: GameState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    gameState: {
      control: 'object',
      description: 'The current game state including turn, phase, and timing information'
    },
    gameProperties: {
      control: 'object',
      description: 'Game properties including name, description, and turn model'
    },
    onNextTurn: {
      action: 'nextTurn',
      description: 'Callback when the next turn button is clicked'
    }
  }
}

type Story = StoryObj<typeof GameState>

export const Default: Story = {
  render: Template,
  args: {
    gameState: mockGameState,
    gameProperties: mockGameProperties,
    onNextTurn: () => {}
  }
}

export const PlanningPhase: Story = {
  render: Template,
  args: {
    gameState: {
      ...mockGameState,
      currentPhase: 'Planning'
    },
    gameProperties: mockGameProperties,
    onNextTurn: () => {}
  }
}

export const ActionPhase: Story = {
  render: Template,
  args: {
    gameState: {
      ...mockGameState,
      currentPhase: 'Action'
    },
    gameProperties: mockGameProperties,
    onNextTurn: () => {}
  }
}

export const AssessmentPhase: Story = {
  render: Template,
  args: {
    gameState: {
      ...mockGameState,
      currentPhase: 'Assessment'
    },
    gameProperties: mockGameProperties,
    onNextTurn: () => {}
  }
}

export const LoadingState: Story = {
  args: {
    gameState: null,
    gameProperties: null,
    onNextTurn: () => {}
  }
}

export default meta
