import React from 'react'
import { Card, Typography, Space, Tag, Button, Tooltip } from 'antd'
import { AimOutlined, ClockCircleOutlined, NumberOutlined, ApartmentOutlined } from '@ant-design/icons'
import { useGameState } from './useGameState'
import { useGameProperties } from '../GameState/useGameSetup'

const { Text } = Typography

const GameState: React.FC = () => {
  const { gameState, nextTurn } = useGameState()
  const { name, description } = useGameProperties()

  // Format the date for display
  const formattedDate = gameState ? new Date(gameState.currentTime).toLocaleString() : ''

  // Determine phase color
  const getPhaseColor = (phase: string) => {
    switch (phase?.toLowerCase()) {
      case 'planning':
        return '#1677ff' // Blue
      case 'action':
        return '#52c41a' // Green
      case 'assessment':
        return '#faad14' // Orange
      default:
        return '#8c8c8c' // Gray
    }
  }

  return (
    <Card
      size='small'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {gameState ? (
        <Space direction='vertical' size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <AimOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <Tooltip title={description}> 
                <Text strong data-testid='turn-number'>{name}</Text>
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <NumberOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <Text strong data-testid='turn-number'>Turn:</Text>
              <Text style={{ marginLeft: 8 }}>{gameState.turn}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ApartmentOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              <Tag color={getPhaseColor(gameState.currentPhase)} data-testid='current-phase'>
                {gameState.currentPhase}
              </Tag>
            </div>
          </div>          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            <Text style={{ marginLeft: 8 }} data-testid='current-time'>{formattedDate}</Text>
          </div>
          <Button
            type="primary"
            onClick={nextTurn}
            style={{ marginTop: 8 }}
          >
            Next Turn
          </Button>
        </Space>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Text type='secondary'>No game state available</Text>
        </div>
      )}
    </Card>
  )
}

export default GameState
