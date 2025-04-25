import { useState, useEffect } from 'react'
// import { mockRooms } from './mockRooms';
import { RoomType } from '../../../../types/rooms-d';
import { useWargame } from '../../../../contexts/WargameContext';
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData';
import { RRoom } from '../../../AdminView/raTypes-d';

export const useRooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { xmppClient } = useWargame()
  const { data: mockRooms, loading } = useIndexedDBData('chatrooms')

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      if (!loading) {
        // ok, use mock data
        const rooms = mockRooms as RRoom[]
        console.log('mock rooms', rooms)
        setRooms(rooms.map((room): RoomType => {
          return {
            roomName: room.id,
            naturalName: room.name,
          }
        }))

      } 
    } else {
      // TODO: use real data
      if (xmppClient.mucService) {
        const fetchRooms = async () => {
          const rooms = await xmppClient.listRooms()
          if (rooms) {
            setRooms(rooms.map((room): RoomType => {
              return {
                roomName: room.jid,
                naturalName: room.name,
              }
            }))
          }
        }
        fetchRooms()
      }
    }
  }, [xmppClient, mockRooms, loading]);

  return { rooms };
}