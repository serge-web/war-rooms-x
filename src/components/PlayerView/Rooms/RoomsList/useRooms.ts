import { useState, useEffect } from 'react'
import { mockRooms } from './mockRooms';
import { MockRoom, RoomType } from '../../../../types/rooms';
import { useWargame } from '../../../../contexts/WargameContext';

export const useRooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { xmppClient } = useWargame()

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      // ok, use mock data
      setRooms(mockRooms.map((room: MockRoom): RoomType => {
        return {
          roomName: room.id,
          naturalName: room.name,
        }
      }))
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
  }, [xmppClient]);

  return { rooms };
}