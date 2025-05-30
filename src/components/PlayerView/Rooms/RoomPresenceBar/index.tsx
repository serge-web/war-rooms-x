import React, { useEffect, useMemo, useState } from 'react'
import './index.css'
import { UserOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { ForceConfigType } from '../../../../types/wargame-d'
import { OnlineUser, PresenceVisibility } from '../../../../types/rooms-d'

export interface RoomPresenceBarProps {
  /** Array of users to display in the presence bar with their online status */
  users: OnlineUser[]
  /** Determines which users are visible - 'all' shows everyone, 'umpires-only' restricts visibility */
  visibilityConfig: PresenceVisibility
  /** The force ID of the current user, used to determine visibility permissions */
  currentUserForce?: ForceConfigType['id']
  /** Whether the current user has admin privileges (admins can see all users regardless of visibilityConfig) */
  isAdmin?: boolean
  /** allows retrieval of force color */
  getForce: (forceId: string) => Promise<ForceConfigType>
}

const RoomPresenceBar: React.FC<RoomPresenceBarProps> = ({
  users,
  visibilityConfig,
  currentUserForce,
  isAdmin = false,
  getForce
}) => {

  const [forceColors, setForceColors] = useState<Record<string, string>>({})  

  // Fetch force colors when users change
  useEffect(() => {
    if (!users) {
      return
    }
    const fetchForceColors = async () => {
      const uniqueForces = [...new Set(users.map(user => user.force))]
      const colorMap: Record<string, string> = {}
      
      for (const forceId of uniqueForces) {
        try {
          if (forceId !== 'unknown' && forceId) {
            const force: ForceConfigType = await getForce(forceId)
            if (force.color) {
              colorMap[forceId] = force.color
            }
          }
        } catch (error) {
          console.error(`Error fetching force color for ${forceId}:`, error)
        }
      }
      
      setForceColors(colorMap)
    }
    
    fetchForceColors()
  }, [users, getForce])

  // Filter users based on visibility config
  const visibleUsers = useMemo(() => {
    // Admins can see all users regardless of config
    if (isAdmin) return users
    switch(visibilityConfig) {
      case 'all':
        return users
      case 'umpires-only':
        return 'umpire' === currentUserForce ? users : []
      case 'none':
        return []
      default:
        return []
    }
  }, [users, visibilityConfig, currentUserForce, isAdmin])  

  if (visibleUsers === undefined || visibleUsers.length === 0) {
    return null // Don't render anything if no users to show
  }

  const userName = (user: OnlineUser): string => {
    return user.name || user.id
  }

  return (
    <div className="room-presence-bar" data-testid="room-presence-bar">
      <div className="presence-users">
        {visibleUsers.map(user => (
          <Tooltip 
            key={user.id} 
            title={`${userName(user)} (${user.force})`}
            placement="bottom"
          >
            <div 
              className={`presence-user ${!user.isOnline ? 'offline' : ''}`}
              data-testid={`presence-user-${user.id}`}
            >
              <UserOutlined style={forceColors[user.force || ''] ? { color: forceColors[user.force || ''] } : undefined} />
              <span className="user-name">{userName(user)}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

export default RoomPresenceBar
