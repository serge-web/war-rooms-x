import { useState, useEffect } from 'react'
import { useWargame } from '../../../../contexts/WargameContext'
import { RoomType } from '../../../../types/rooms-d'
import { OnlineUser, PresenceVisibility } from './index'
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData'
import { RRoom, RUser } from '../../../../components/AdminView/raTypes-d'

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
              
              // Map room members to OnlineUser objects
              // For now, we'll set all users as online
              // This will be updated in Step 3 with actual presence data
              const mappedUsers = await Promise.all(roomMembers.map(async (user) => {
                // Extract user ID from JID
                const userId = user.jid.split('@')[0]
                
                // Try to get force information
                let forceId = 'unknown'
                try {
                  // This is a placeholder - in a real implementation, we would
                  // fetch the user's force from the server
                  const userJid = user.jid.split('/')[0]
                  const userDoc = await xmppClient.getUserVCard(userJid)
                  forceId = userDoc?.organization || 'unknown'
                } catch (err) {
                  console.error('Error fetching user force:', err)
                }
                
                return {
                  id: userId,
                  name: user.name || userId,
                  force: forceId,
                  isOnline: true // All users are considered online for now
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
  }, [xmppClient, room, mockRooms])
  
  return { users, presenceVisibility, loading, error }
}
