import React from 'react'
import { Card, Avatar, Typography, Space, Tag, Tooltip, Button, Divider, Badge } from 'antd'
import { UserOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons'
import { mockUserDetails, mockForceDetails } from './mockData'
import { useWargame } from '../../../contexts/WargameContext'

const { Text, Title } = Typography

interface UserDetailsProps {
  username?: string
  force?: string
  role?: string
  status?: 'online' | 'away' | 'offline'
}

const UserDetails: React.FC<UserDetailsProps> = ({
  force = mockForceDetails.name,
  role = mockUserDetails.role,
  status = mockUserDetails.status
}) => {
  const { setLoggedIn } = useWargame()
  
  const handleLogout = () => {
    setLoggedIn(false)
  }
  // In the future, this would use the usePlayer and useForce hooks
  const isLoggedIn = !!role

  const statusColors = {
    online: '#52c41a',
    away: '#faad14',
    offline: '#f5222d'
  }

  return (
    <Card 
      size='small' 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {isLoggedIn ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge dot status={status as 'success' | 'warning' | 'error'} offset={[-4, 44]}>
              <Avatar 
                size={48} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: mockForceDetails.color }} 
              />
            </Badge>
            <div style={{ marginLeft: 12, flex: 1 }}>
              <Space direction='vertical' size={0} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>{role}</Title>
                  <Tag color={statusColors[status]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Tag>
                </div>
              </Space>
            </div>
          </div>
          
          <Divider style={{ margin: '8px 0' }} />
          
          <div style={{ flex: 1 }}>
            <Space direction='vertical' size={4} style={{ width: '100%' }}>
              {force && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ color: mockForceDetails.color, marginRight: 8 }} />
                  <Text strong>{force}</Text>
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
