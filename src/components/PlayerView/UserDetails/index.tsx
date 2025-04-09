import React from 'react'
import { Card, Avatar, Typography, Space, Tooltip, Button, Divider, Badge } from 'antd'
import { UserOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons'
import { useWargame } from '../../../contexts/WargameContext'

const { Text, Title } = Typography

const UserDetails: React.FC = () => {
  const { setLoggedIn, playerDetails, playerForce } = useWargame()
  
  const handleLogout = () => {
    setLoggedIn(false)
  }
  // In the future, this would use the usePlayer and useForce hooks
  const isLoggedIn = !!playerDetails

  console.log('player', playerDetails)

  return (
    <Card 
      size='small' 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {isLoggedIn ? (
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
                  <Title level={5} style={{ margin: 0 }}>{playerDetails?.name}</Title>
                </div>
              </Space>
            </div>
          </div>
          
          <Divider style={{ margin: '8px 0' }} />
          
          <div style={{ flex: 1 }}>
            <Space direction='vertical' size={4} style={{ width: '100%' }}>
              {playerForce && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ color: playerForce.color, marginRight: 8 }} />
                  <Text strong>{playerForce.fullName}</Text>
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
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Space direction='vertical' align='center'>
            <Avatar 
              size={48} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#d9d9d9' }} 
            />
            <Text type='secondary'>Not logged in</Text>
          </Space>
        </div>
      )}
    </Card>
  )
}

export default UserDetails
