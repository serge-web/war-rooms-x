import type { Meta, StoryObj } from '@storybook/react'
import GameState from './index'
import { WargameContext } from '../../../contexts/WargameContext'
import { GamePropertiesType, GameStateType, ForceConfigType, UserConfigType } from '../../../types/wargame-d'
import React, { useMemo, useState } from 'react'

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

  const [gameProperties] = useState<GamePropertiesType | null>(
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
        })
  )

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
    nextTurn: async () => {
      if (gameState) {
        const newTurn = parseInt(gameState.turn) + 1
        setGameState({
          ...gameState,
          turn: newTurn.toString(),
          currentPhase: gameState.currentPhase === 'Planning' ? 'Action' : 'Planning'
        })
      }
    },
    rooms: []
  }), [gameState, gameProperties])

  return (
    <WargameContext.Provider value={wargameContextValue}>
      <div style={{ width: '400px', height: '200px' }}>
        <Story />
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

export const PlanningPhase: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: '5',
        currentPhase: 'Planning',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Coastal defense exercise',
        startTime: new Date().toISOString(),
        interval: '1h',
        turnType: 'linear'
      },
    },
  },
}

export const ActionPhase: Story = {
  parameters: {
    wargame: {
      gameState: {
        currentTime: new Date().toISOString(),
        turn: '5',
        currentPhase: 'Action',
      },
      gameProperties: {
        name: 'Operation Thunderstrike',
        description: 'Coastal defense exercise',
        startTime: new Date().toISOString(),
        interval: '1h',
        turnType: 'linear'
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
