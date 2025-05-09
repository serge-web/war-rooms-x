import { useState, useEffect } from 'react'
import { useWargame } from '../../../../contexts/WargameContext'
import { RoomType } from '../../../../types/rooms-d'
import { OnlineUser, PresenceVisibility } from './index'
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData'
import { RRoom, RUser } from '../../../../components/AdminView/raTypes-d'
import { usePresence } from '../../../../hooks/usePresence'

export interface UseRoomUsersResult {
  users: OnlineUser[]
  presenceVisibility: PresenceVisibility
  loading: boolean
  error: string | null
}

export const useRoomUsers = (room: RoomType): UseRoomUsersResult => {
  const { xmppClient } = useWargame()
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [presenceVisibility, setPresenceVisibility] = useState<PresenceVisibility>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: mockRooms } = useIndexedDBData<RRoom[]>('chatrooms')
  
  // Use the presence hook to track user presence in the room
  const { isUserOnline, presenceMap } = usePresence(room.roomName)

  // Fetch initial room users data
  useEffect(() => {
    const fetchRoomUsers = async () => {
      try {
        setLoading(true)
        
        if (xmppClient === undefined) {
          // Waiting for login
          return
        } else if (xmppClient === null) {
          // Use mock data
          if (mockRooms) {
            const mockRoom = mockRooms.find(r => r.id === room.roomName)
            if (mockRoom) {
              // Get room configuration for presence visibility
              const roomConfig = mockRoom.presenceConfig || 'all'
              setPresenceVisibility(roomConfig as PresenceVisibility)
              
              // Get mock users
              const mockUsers = mockRoom.dummyUsers || []
              setUsers(mockUsers.map((user: RUser) => ({
                id: user.jid,
                name: user.name,
                force: user.force || 'unknown',
                isOnline: true // All mock users are considered online for now
              })))
            }
          }
        } else {
          // Get real data from XMPP
          if (xmppClient.mucService) {
            try {
              // Get room configuration
              const roomDetails = room.description ? JSON.parse(room.description) : {}
              const roomConfig = roomDetails.presenceVisibility || 'all'
              setPresenceVisibility(roomConfig as PresenceVisibility)
              
              // Get room members from XMPP
              const roomMembers = await xmppClient.getRoomMembers(room.roomName)
              
              // Map room members to OnlineUser objects with presence information
              const mappedUsers = await Promise.all(roomMembers.map(async (user) => {
                // Extract user ID from JID
                const userId = user.jid.split('@')[0]
                const userJid = user.jid.split('/')[0]
                
                // Try to get force information
                let forceId = 'unknown'
                try {
                  const userDoc = await xmppClient.getUserVCard(userJid)
                  forceId = userDoc?.organization || 'unknown'
                } catch (err) {
                  console.error('Error fetching user force:', err)
                }
                
                // Get the user's online status from the presence hook
                const isOnline = isUserOnline(userJid)
                
                return {
                  id: userId,
                  name: user.name || userId,
                  force: forceId,
                  isOnline
                }
              }))
              
              setUsers(mappedUsers)
            } catch (err) {
              console.error('Error fetching room users:', err)
              setError('Failed to fetch room users')
            }
          }
        }
      } catch (err) {
        console.error('Error in useRoomUsers:', err)
        setError('An error occurred while fetching room users')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoomUsers()
  }, [room, xmppClient, mockRooms, isUserOnline])
  
  // Update user online status when presence changes
  useEffect(() => {
    // Skip if we don't have any users yet
    if (users.length === 0) return
    
    // Update the online status of users based on the presence map
    setUsers(prevUsers => 
      prevUsers.map(user => {
        const userJid = `${user.id}@${room.roomName.split('@')[1]}`
        return {
          ...user,
          isOnline: isUserOnline(userJid)
        }
      })
    )
  }, [presenceMap, room.roomName, isUserOnline, users.length])
  
  return { users, presenceVisibility, loading, error }
}
