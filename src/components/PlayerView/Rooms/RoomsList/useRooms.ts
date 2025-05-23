import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { RoomType } from '../../../../types/rooms-d';
import * as localforage from 'localforage'
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData';
import { prefixKey } from '../../../../types/constants';
import { RRoom } from '../../../AdminView/raTypes-d';
import { XMPPService } from '../../../../services/xmpp';
import { MockId } from '../../../../types/wargame-d';
import { RoomChangeEvent } from '../../../../services/types';

export const useRooms = (xmppClient: XMPPService | null | undefined, mockPlayerId: MockId | null) => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')
  const [hasInitializedRooms, setHasInitializedRooms] = useState(false)
  const prevXmppClientState = useRef<'undefined' | 'null' | 'connected'>(xmppClient === undefined ? 'undefined' : xmppClient === null ? 'null' : 'connected')

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

  // Function to refresh IndexedDB data
  const refreshMockRoomsData = useCallback(async () => {
    try {
      // Directly fetch the latest data from IndexedDB
      const freshMockRooms = await localforage.getItem<RRoom[]>(`${prefixKey}chatrooms`)
      return freshMockRooms
    } catch (error) {
      console.error('Error refreshing mock rooms data:', error)
      return null
    }
  }, [])

  // Effect for mock data handling
  useEffect(() => {
    const loadMockRooms = async () => {
      if (xmppClient === null && !loading && mockPlayerInfoItem.playerId) {
        // Check if we're switching from a different state to mock mode
        const currentState = 'null'
        const previousState = prevXmppClientState.current
        
        // If we're switching states or mockRooms is null, refresh the data
        if (previousState !== currentState || !mockRooms) {
          // Get fresh data directly from IndexedDB
          const freshMockRooms = await refreshMockRoomsData()
          
          if (freshMockRooms) {
            // ok, use fresh mock data
            const myId = mockPlayerInfoItem.playerId
            const myForce = mockPlayerInfoItem.forceId
            const imAdmin = myId === 'admin'
            const isMyForce = (r: RRoom) => myForce && r.memberForces?.includes(myForce)
            const isMyId = (r: RRoom) => r.members?.includes(myId)
            const isAdminRoom = (r: RRoom) => r.id === '__admin'
            const myRooms = freshMockRooms.filter(r => imAdmin || isAdminRoom(r) || isMyForce(r) || isMyId(r))
            
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
        } else if (mockRooms) {
          // Use the data from the hook if we're not switching states
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
        
        // Update previous state reference
        prevXmppClientState.current = currentState
      }
    }
    
    loadMockRooms()
  }, [xmppClient, mockRooms, loading, mockPlayerInfoItem, refreshMockRoomsData, prevXmppClientState]);

  // Separate effect for XMPP client initialization
  useEffect(() => {
    // Determine current client state
    const currentState = xmppClient === undefined ? 'undefined' : xmppClient === null ? 'null' : 'connected'
    const previousState = prevXmppClientState.current
    
    // If state has changed, reset and reinitialize
    if (currentState !== previousState) {
      if (xmppClient === undefined) {
        console.log('clearing rooms')
        fetchRooms(undefined)
        setHasInitializedRooms(false)
      } else if (xmppClient && xmppClient.mucServiceUrl && !hasInitializedRooms) {
        // Initial fetch of rooms
        fetchRooms(xmppClient)
      }
      
      // Update previous state reference
      prevXmppClientState.current = currentState
    } else if (xmppClient && xmppClient.mucServiceUrl && !hasInitializedRooms) {
      // Initial fetch of rooms if not initialized yet
      fetchRooms(xmppClient)
    }
  }, [xmppClient, fetchRooms, hasInitializedRooms, prevXmppClientState]);
  
  // Separate effect for room change subscription
  useEffect(() => {
    // Only set up subscription after rooms are initialized and when xmppClient changes
    if (xmppClient && hasInitializedRooms) {
      // Subscribe to room change events
      const unsubscribe = xmppClient.subscribeToRoomChanges(handleRoomChange)
      
      // Clean up subscription when component unmounts or xmppClient changes
      return () => {
        unsubscribe()
      }
    }
  }, [xmppClient, handleRoomChange, hasInitializedRooms]);

  return { rooms };
}