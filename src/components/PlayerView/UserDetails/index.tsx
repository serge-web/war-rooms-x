import React from 'react'
import { Card, Avatar, Typography, Space, Tooltip, Button, Badge } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useWargame } from '../../../contexts/WargameContext'
import { usePlayerDetails } from './usePlayerDetails'

const { Title } = Typography

const UserDetails: React.FC = () => {
  const { setXmppClient, xmppClient } = useWargame()
  const { playerDetails } = usePlayerDetails()

  const handleLogout = () => {
    if (xmppClient) {
      xmppClient.disconnect()
    }
    console.clear()
    setXmppClient(undefined)
  }

  const debugAction = async () => {
    // create vCard for this user
    // if (xmppClient) {
    //   const vCard: VCardData = {
    //     jid: xmppClient.bareJid,
    //     fullName: 'Umpire',
    //     organization: JSON.stringify({
    //       fullName: 'Umpire',
    //       color: '#ccc'
    //     })
    //   }
    //   await xmppClient.setVCard(vCard)
    // }
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
              style={{ backgroundColor: playerDetails?.color || '#00f' }} 
            />
          </Badge>
          <div style={{ marginLeft: 12, flex: 1 }}>
            <Space direction='vertical' size={0} style={{ width: '100%' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>{playerDetails?.role || playerDetails?.id || 'unknown'}</Title>
                <Title level={5} style={{ margin: 0 }}>{playerDetails?.forceName || 'unknown'}</Title>
              </div>
            </Space>
          </div>
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
          <Button type='primary' onClick={debugAction} size='small'>Debug</Button>
        </div>
      </div>
    </Card>
  )
}

export default UserDetails
