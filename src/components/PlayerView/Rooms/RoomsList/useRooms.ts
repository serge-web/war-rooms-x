import { useState, useEffect, useMemo, useCallback } from 'react'
import { RoomType } from '../../../../types/rooms-d';
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData';
import { RRoom } from '../../../AdminView/raTypes-d';
import { XMPPService } from '../../../../services/xmpp';
import { MockId } from '../../../../types/wargame-d';
import { RoomChangeEvent } from '../../../../services/types';

export const useRooms = (xmppClient: XMPPService | null | undefined, mockPlayerId: MockId | null) => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')
  const [hasInitializedRooms, setHasInitializedRooms] = useState(false)

  // Memoize the player ID and force ID to prevent unnecessary re-renders. The
  // useEffect hook kept re-rendering since is an oobject it was
  // treated as a new value each time
  const mockPlayerInfoItem = useMemo(() => {
    return {
      playerId: mockPlayerId?.playerId,
      forceId: mockPlayerId?.forceId
    }
  }, [mockPlayerId?.playerId, mockPlayerId?.forceId])  
  
  // Function to fetch rooms from XMPP server
  const fetchRooms = useCallback(async (client: XMPPService | undefined) => {
    if (!client) {
      // user may have logged out. We'll need to reihitialise
      setHasInitializedRooms(false)
      setRooms([])
      return
    }
    if (!client.mucServiceUrl) return
    
    try {
      const rooms = await client.listRooms()
      // get the room description
      const getInfoActions = rooms.map((room) => {
        return client.client?.getDiscoInfo(room.jid)
      })
      const infos = await Promise.all(getInfoActions)
      
      if (rooms) {
        const roomsList = rooms.map((room, i): RoomType => {
          const info = infos[i]?.extensions[0].fields?.find((f) => f.name === 'muc#roominfo_description')
          return {
            roomName: room.jid,
            naturalName: room.name,
            description: info?.value as string || ''
          }
        })
        
        setRooms(roomsList)
        setHasInitializedRooms(true)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }, [])

  // Handle room change events
  const handleRoomChange = useCallback(async (roomJid: string, event: RoomChangeEvent) => {
    console.log(`Room change detected: ${event} room ${roomJid}`)
    
    if (!xmppClient || !hasInitializedRooms) return
    
    if (event === 'leave') {
      // Remove the room from the list
      setRooms(prevRooms => prevRooms.filter(room => room.roomName !== roomJid))
    } else if (event === 'enter') {
      // Only add the room if it's not already in the list
      const existingRoom = rooms.find(room => room.roomName === roomJid)
      if (!existingRoom) {
        try {
          // Get room info for the specific room
          const info = await xmppClient.client?.getDiscoInfo(roomJid)
          const roomName = roomJid.split('@')[0]
          const description = info?.extensions[0].fields?.find((f) => f.name === 'muc#roominfo_description')?.value as string || ''
          console.log('Adding new room:', roomName)
          
          // Add the new room to the list
          setRooms(prevRooms => [
            ...prevRooms,
            {
              roomName: roomJid,
              naturalName: roomName,
              description
            }
          ])
        } catch (error) {
          console.error('Error fetching room info:', error)
        }
      }
    }
  }, [xmppClient, rooms, hasInitializedRooms])

  // Effect for mock data handling
  useEffect(() => {
    if (xmppClient === null && !loading && mockPlayerInfoItem.playerId && mockRooms) {
      // ok, use mock data
      const myId = mockPlayerInfoItem.playerId
      const myForce = mockPlayerInfoItem.forceId
      const imAdmin = myId === 'admin'
      const isMyForce = (r: RRoom) => myForce && r.memberForces?.includes(myForce)
      const isMyId = (r: RRoom) => r.members?.includes(myId)
      const isAdminRoom = (r: RRoom) => r.id === '__admin'
      const myRooms = mockRooms.filter(r => imAdmin || isAdminRoom(r) || isMyForce(r) || isMyId(r))
      // filter rooms for those for my role/force
      setRooms(myRooms.map((room: RRoom): RoomType => {
        return {
          roomName: room.id,
          naturalName: room.name,
          description: JSON.stringify(room.details)
        }
      }))
      setHasInitializedRooms(true)
    }
  }, [xmppClient, mockRooms, loading, mockPlayerInfoItem]);

  // Separate effect for XMPP client initialization
  useEffect(() => {
    if (xmppClient === undefined) {
      fetchRooms(undefined) 
      return
    }
    // Only run this effect when xmppClient changes and is not null or undefined
    if (xmppClient && xmppClient.mucServiceUrl && !hasInitializedRooms) {
      console.log('Initial room fetch')
      // Initial fetch of rooms
      fetchRooms(xmppClient)
    }
  }, [xmppClient, fetchRooms, hasInitializedRooms]);
  
  // Separate effect for room change subscription
  useEffect(() => {
    // Only set up subscription after rooms are initialized and when xmppClient changes
    if (xmppClient && hasInitializedRooms) {
      console.log('Setting up room change subscription')
      
      // Subscribe to room change events
      const unsubscribe = xmppClient.subscribeToRoomChanges(handleRoomChange)
      
      // Clean up subscription when component unmounts or xmppClient changes
      return () => {
        console.log('Unsubscribing from room changes')
        unsubscribe()
      }
    }
  }, [xmppClient, handleRoomChange, hasInitializedRooms]);

  return { rooms };
}