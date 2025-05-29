import type { Meta, StoryObj } from '@storybook/react'
import GameState from './index'
import { WargameContext } from '../../../contexts/WargameContext'
import { GamePropertiesType, GameStateType, ForceConfigType, UserConfigType } from '../../../types/wargame-d'
import { advanceTurn } from '../../../helpers/turn-model'
import { LINEAR_TURNS, PLAN_ADJUDICATE_TURNS } from '../../../types/constants'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Space } from 'antd'

// Types for our turn model implementations
interface TurnModel {
  name: string
  description: string
  turnType: 'Plan/Adjudicate' | 'Linear'
  initialPhase: string
}

// Different turn model implementations
const TURN_MODELS: Record<string, TurnModel> = {
  linear: {
    name: 'Linear',
    description: 'Simple sequential turns with a single active phase',
    turnType: 'Linear',
    initialPhase: 'Active'
  },
  planAdjudicate: {
    name: 'Plan/Adjudicate',
    description: 'Alternates between Planning (a) and Adjudication (b) phases',
    turnType: 'Plan/Adjudicate',
    initialPhase: 'Planning'
  }
}

// Mock WargameProvider wrapper for stories
const WargameProviderDecorator = (Story: React.ComponentType, { parameters }: { parameters?: { wargame?: { gameState?: Partial<GameStateType> | null, gameProperties?: Partial<GamePropertiesType> | null } } }) => {
  // Use null if explicitly set to null in parameters, otherwise use provided values or defaults
  const [gameState, setGameState] = useState<GameStateType | null>(
    parameters?.wargame?.gameState === null 
      ? null 
      : (parameters?.wargame?.gameState ? {
          currentTime: parameters.wargame.gameState.currentTime || new Date().toISOString(),
          turn: parameters.wargame.gameState.turn || '1',
          currentPhase: parameters.wargame.gameState.currentPhase || 'Planning'
        } : {
          currentTime: new Date().toISOString(),
          turn: '1',
          currentPhase: 'Planning'
        })
  )

  const [gameProperties, setGameProperties] = useState<GamePropertiesType | null>(
    parameters?.wargame?.gameProperties === null
      ? null
      : (parameters?.wargame?.gameProperties ? {
          name: parameters.wargame.gameProperties.name || 'Operation Thunderstrike',
          description: parameters.wargame.gameProperties.description || 'Coastal defense exercise',
          startTime: parameters.wargame.gameProperties.startTime || new Date().toISOString(),
          interval: parameters.wargame.gameProperties.interval || '1h',
          turnType: parameters.wargame.gameProperties.turnType || 'Linear'
        } : {
          name: 'Operation Thunderstrike',
          description: 'Coastal defense exercise',
          startTime: new Date().toISOString(),
          interval: '1h',
          turnType: 'Linear'
        } as GamePropertiesType)
  )

  // Handle turn advancement using the actual advanceTurn function
  const nextTurn = useCallback(async () => {
    if (!gameState || !gameProperties) return
    
    const newState = advanceTurn(
      gameState,
      gameProperties.turnType,
      gameProperties.interval
    )
    
    setGameState(newState)
  }, [gameState, gameProperties])
  
  // Change turn model
  const changeTurnModel = useCallback((modelKey: string) => {
    if (!gameProperties) return
    
    const model = TURN_MODELS[modelKey]
    if (!model) return
    
    setGameProperties({
      ...gameProperties,
      turnType: model.turnType
    })
    
    // Reset to initial state for the new turn model
    const isPlanAdjudicate = model.turnType === 'Plan/Adjudicate'
    setGameState({
      currentTime: new Date().toISOString(),
      turn: isPlanAdjudicate ? '1.a' : '1',
      currentPhase: isPlanAdjudicate ? 'Planning' : 'Active'
    })
  }, [gameProperties])

  // Mock WargameContext value
  const wargameContextValue = useMemo(() => ({
    loggedIn: true,
    xmppClient: null,
    setXmppClient: () => {},
    raDataProvider: undefined,
    setRaDataProvider: () => {},
    mockPlayerId: null,
    setMockPlayerId: () => {},
    playerDetails: {
      id: 'player1',
      role: 'Game Master',
      forceId: 'blue',
      forceName: 'Blue Force',
      color: '#1890ff'
    },
    getForce: async (forceId: string): Promise<ForceConfigType> => ({
      type: 'force-config-type-v1',
      id: forceId || 'blue',
      name: forceId === 'red' ? 'Red Force' : 'Blue Force',
      color: forceId === 'red' ? '#ff4d4f' : '#1890ff',
      objectives: forceId === 'red' ? 'Eliminate blue force' : 'Defend the position'
    }),
    getPlayerDetails: async (): Promise<UserConfigType | undefined> => ({
      type: 'user-config-type-v1',
      name: 'Game Master',
      forceId: 'blue'
    }),
    gameProperties,
    gameState,
    nextTurn,
    rooms: []
  }), [gameState, gameProperties, nextTurn])
  
  // Add controls for the story
  const Controls = useMemo(() => {
    if (!gameState || !gameProperties) return null
    
    const currentModel = Object.entries(TURN_MODELS).find(
      ([, model]) => model.turnType === gameProperties.turnType
    )?.[1] || TURN_MODELS.linear
    
    return (
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Turn Model: {currentModel.name}</h4>
        <p>{currentModel.description}</p>
        <Space wrap>
          {Object.entries(TURN_MODELS).map(([key, model]) => (
            <Button 
              key={key}
              type={gameProperties.turnType === model.turnType ? 'primary' : 'text'}
              onClick={() => changeTurnModel(key)}
            >
              {model.name}
            </Button>
          ))}
        </Space>
        <br/>
        <Button type="primary" onClick={nextTurn}>
          Next Turn/Phase
        </Button>
        <div style={{ marginTop: '0.5rem' }}>
          <strong>Current State:</strong> Turn {gameState.turn}, Phase: {gameState.currentPhase}
        </div>
      </div>
    )
  }, [gameState, gameProperties, nextTurn, changeTurnModel])

  return (
    <WargameContext.Provider value={wargameContextValue}>
      <div style={{ maxWidth: '800px', padding: '1rem' }}>
        {Controls}
        <div style={{ marginTop: '1rem' }}>
          <Story />
        </div>
      </div>
    </WargameContext.Provider>
  )
}

const meta: Meta<typeof GameState> = {
  title: 'PlayerView/GameState',
  component: GameState,
  tags: ['autodocs'],
  decorators: [WargameProviderDecorator]
}

export default meta
type Story = StoryObj<typeof GameState>

export const Default: Story = {}

export const LinearTurns: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: '1',
        currentPhase: 'Active',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Linear turn model demo',
        startTime: new Date().toISOString(),
        interval: '1h',
        turnType: LINEAR_TURNS
      },
    },
  },
}

export const PlanAdjudicateTurns: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: '1.a',
        currentPhase: 'Planning',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Plan/Adjudicate turn model demo',
        startTime: new Date().toISOString(),
        interval: '1h',
        turnType: PLAN_ADJUDICATE_TURNS
      },
    },
  },
}

export const NoGameState: Story = {
  decorators: [
    (Story) => {
      // Mock WargameContext value with null states
      const wargameContextValue = {
        loggedIn: true,
        xmppClient: null,
        setXmppClient: () => {},
        raDataProvider: undefined,
        setRaDataProvider: () => {},
        mockPlayerId: null,
        setMockPlayerId: () => {},
        playerDetails: null,
        getForce: async (): Promise<ForceConfigType> => ({
          type: 'force-config-type-v1',
          id: 'blue',
          name: 'Blue Force',
          color: '#1890ff',
          objectives: 'No active game state'
        }),
        getPlayerDetails: async (): Promise<UserConfigType | undefined> => ({
          type: 'user-config-type-v1',
          name: 'Game Master',
          forceId: 'blue'
        }),
        gameProperties: null,
        gameState: null,
        nextTurn: async () => {},
        rooms: []
      }

      return (
        <WargameContext.Provider value={wargameContextValue}>
          <div style={{ width: '400px', height: '200px' }}>
            <Story />
          </div>
        </WargameContext.Provider>
      )
    }
  ]
}
