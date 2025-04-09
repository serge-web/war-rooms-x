import React from 'react'
import { useWargame } from '../../../hooks/useWargame'
import { Card, Typography, Space, Tag, Spin, Divider } from 'antd'
import { ClockCircleOutlined, NumberOutlined, ApartmentOutlined } from '@ant-design/icons'

const { Text } = Typography

const GameState: React.FC = () => {
  const { gameState, loading } = useWargame()

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
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin tip='Loading game state...' />
        </div>
      ) : gameState ? (
        <Space direction='vertical' size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          
          <Divider style={{ margin: '8px 0' }} />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />
            <Text style={{ marginLeft: 8 }} data-testid='current-time'>{formattedDate}</Text>
          </div>
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
