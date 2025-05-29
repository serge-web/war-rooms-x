import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useCallback, useEffect } from 'react'
import { Button, Space, Input, Typography } from 'antd'
import GameState, { GameStateProps } from './index'
import { GameStateType, GamePropertiesType } from '../../../../src/types/wargame-d'
import { advanceTurn } from '../../../../src/helpers/turn-model'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../../../../src/types/constants'

// Mock data for different states
// Define turn model types
type TurnModelType = GamePropertiesType['turnType']

// Default game properties for each turn model
const defaultGameProperties: Omit<GamePropertiesType, 'turnType' | 'interval'> & {
  intervals: Record<string, string>
} = {
  name: 'Operation Desert Storm',
  description: 'A test wargame scenario',
  startTime: new Date().toISOString(),
  // Default intervals for each turn model
  intervals: {
    [LINEAR_TURNS as string]: 'PT1H',        // 1 hour
    [PLAN_ADJUDICATE_TURNS as string]: 'PT30M'  // 30 minutes
  } as Record<string, string>
}

// Helper to create a valid GameStateType with required fields
const createGameState = (overrides: Partial<GameStateType> = {}): GameStateType => ({
  turn: '1',
  currentPhase: 'Active',
  currentTime: new Date().toISOString(),
  ...overrides
})

// Default game state for each turn model
const defaultGameStates: Record<string, GameStateType> = {
  [LINEAR_TURNS]: createGameState({
    turn: '1',
    currentPhase: 'Active'
  }),
  [PLAN_ADJUDICATE_TURNS]: createGameState({
    turn: '1.a',
    currentPhase: 'Planning'
  })
}

// Template for stories
const Template = (args: GameStateProps) => {
  const [turnModel, setTurnModel] = useState<TurnModelType>(LINEAR_TURNS)
  const [interval, setInterval] = useState<string>(defaultGameProperties.intervals[LINEAR_TURNS])
  const [gameState, setGameState] = useState<GameStateType>(
    args.gameState || defaultGameStates[LINEAR_TURNS]
  )
  const [gameProperties, setGameProperties] = useState<GamePropertiesType>(() => ({
    ...defaultGameProperties,
    turnType: LINEAR_TURNS,
    interval: defaultGameProperties.intervals[LINEAR_TURNS],
    ...(args.gameProperties || {})
  }))

  // Update turn model when game properties change
  useEffect(() => {
    setTurnModel(gameProperties.turnType)
    setInterval(gameProperties.interval)
  }, [gameProperties.turnType, gameProperties.interval])

  // Handle turn model change
  const handleTurnModelChange = useCallback((model: TurnModelType) => {
    const newInterval = defaultGameProperties.intervals[model]
    setTurnModel(model)
    setInterval(newInterval)
    setGameState({
      ...defaultGameStates[model as keyof typeof defaultGameStates]
    })
    setGameProperties(prev => ({
      ...prev,
      turnType: model,
      interval: newInterval
    }))
  }, [])

  // Handle interval change
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = e.target.value
    setInterval(newInterval)
    setGameProperties(prev => ({
      ...prev,
      interval: newInterval
    }))
  }

  // Handle next turn using the real advanceTurn function
  const handleNextTurn = useCallback(() => {
    if (!gameState) return
    
    try {
      const newState = advanceTurn(
        gameState,
        gameProperties.turnType,
        interval
      )
      setGameState(newState)
    } catch (error) {
      console.error('Error advancing turn:', error)
    }
  }, [gameState, gameProperties, interval])

  return (
    <div style={{ maxWidth: '500px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          Turn Model:
          <Space>
            <Button 
              type={turnModel === LINEAR_TURNS ? 'primary' : 'default'}
              onClick={() => handleTurnModelChange(LINEAR_TURNS)}
            >
              Linear Turns
            </Button>
            <Button 
              type={turnModel === PLAN_ADJUDICATE_TURNS ? 'primary' : 'default'}
              onClick={() => handleTurnModelChange(PLAN_ADJUDICATE_TURNS)}
            >
              Plan/Adjudicate
            </Button>
          </Space>
        </div>

        <div>
          Turn Interval (ISO 8601):
          <Input 
            value={interval}
            onChange={handleIntervalChange}
            placeholder="e.g., PT1H for 1 hour"
            style={{ width: '200px' }}
          />
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
            Examples: PT1H (1 hour), PT30M (30 minutes), P1D (1 day)
          </Typography.Text>
        </div>

        <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px' }}>
          <GameState 
            gameState={gameState}
            gameProperties={gameProperties}
            onNextTurn={handleNextTurn}
          />
        </div>
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

export const LinearTurns: Story = {
  render: Template,
  args: {
    gameState: {
      ...defaultGameStates[LINEAR_TURNS]
    },
    gameProperties: {
      ...defaultGameProperties,
      turnType: LINEAR_TURNS,
      interval: defaultGameProperties.intervals[LINEAR_TURNS]
    },
    onNextTurn: () => {}
  }
}

export const PlanAdjudicateTurns: Story = {
  render: Template,
  args: {
    gameState: createGameState({
      ...defaultGameStates[PLAN_ADJUDICATE_TURNS]
    }),
    gameProperties: {
      ...defaultGameProperties,
      turnType: PLAN_ADJUDICATE_TURNS,
      interval: defaultGameProperties.intervals[PLAN_ADJUDICATE_TURNS]
    },
    onNextTurn: () => {}
  }
}

export const CustomInterval: Story = {
  render: Template,
  args: {
    gameState: {
      ...defaultGameStates[LINEAR_TURNS]
    },
    gameProperties: {
      ...defaultGameProperties,
      turnType: LINEAR_TURNS,
      interval: 'PT15M' // 15 minutes
    },
    onNextTurn: () => {}
  }
}

export default meta
