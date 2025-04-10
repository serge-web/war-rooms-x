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
    }
  }, [xmppClient]);

  return { rooms };
}