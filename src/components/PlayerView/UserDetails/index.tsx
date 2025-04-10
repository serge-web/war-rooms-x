import React from 'react'
import { Card, Avatar, Typography, Space, Tooltip, Button, Divider, Badge } from 'antd'
import { UserOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons'
import { useWargame } from '../../../contexts/WargameContext'
import { usePlayerDetails } from './usePlayerDetails'

const { Text, Title } = Typography

const UserDetails: React.FC = () => {
  const { setXmppClient, loggedIn, xmppClient } = useWargame()
  const { playerDetails } = usePlayerDetails()

  if (!loggedIn)
    return

  if (!playerDetails)
    return

  console.log('player details', playerDetails)
  const handleLogout = () => {
    if (xmppClient) {
      xmppClient.disconnect()
    }
    setXmppClient(undefined)
  }

  return (
    <Card 
      size='small' 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge dot status={'success'} offset={[-4, 44]}>
            <Avatar 
              size={48} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#00f' }} 
            />
          </Badge>
          <div style={{ marginLeft: 12, flex: 1 }}>
            <Space direction='vertical' size={0} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>{playerDetails.role || playerDetails.id}</Title>
              </div>
            </Space>
          </div>
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ flex: 1 }}>
          <Space direction='vertical' size={4} style={{ width: '100%' }}>
            {playerDetails && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ color: playerDetails.color, marginRight: 8 }} />
                <Text strong>{playerDetails.forceName}</Text>
              </div>
            )}
          </Space>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Tooltip title='Logout'>
            <Button 
              type='primary' 
              icon={<LogoutOutlined />} 
              onClick={handleLogout} 
              size='small'
              danger
            >
              Logout
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  )
}

export default UserDetails
