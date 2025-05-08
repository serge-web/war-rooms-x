import React from 'react'
import './index.css'
import { UserOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

export type PresenceVisibility = 'all' | 'umpires-only'

export interface OnlineUser {
  id: string
  name: string
  force: string
  isOnline: boolean
}

export interface RoomPresenceBarProps {
  users: OnlineUser[]
  visibilityConfig: PresenceVisibility
  currentUserForce?: string
  isAdmin?: boolean
}

const RoomPresenceBar: React.FC<RoomPresenceBarProps> = ({
  users,
  visibilityConfig,
  currentUserForce,
  isAdmin = false
}) => {
  // Filter users based on visibility config
  const visibleUsers = users.filter(user => {
    // Admins can see all users regardless of config
    if (isAdmin) return true
    
    // If config is set to show all users
    if (visibilityConfig === 'all') return true
    
    // If config is set to show only umpires and the user is an umpire
    if (visibilityConfig === 'umpires-only' && user.force === 'umpire') return true
    
    // If the user is from the same force as the current user
    if (user.force === currentUserForce) return true
    
    return false
  })

  if (visibleUsers.length === 0) {
    return null // Don't render anything if no users to show
  }

  return (
    <div className="room-presence-bar" data-testid="room-presence-bar">
      <div className="presence-users">
        {visibleUsers.map(user => (
          <Tooltip 
            key={user.id} 
            title={`${user.name} (${user.force})`}
            placement="bottom"
          >
            <div 
              className={`presence-user ${!user.isOnline ? 'offline' : ''}`}
              data-testid={`presence-user-${user.id}`}
            >
              <UserOutlined />
              <span className="user-name">{user.name}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

export default RoomPresenceBar
