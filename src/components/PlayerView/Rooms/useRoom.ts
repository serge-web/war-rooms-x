import { useState, useEffect } from 'react'
import { Message, RoomType } from '../../../types/rooms';
import { mockRooms } from './RoomsList/mockRooms';
import { useWargame } from '../../../contexts/WargameContext';

export const useRoom = (room: RoomType) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { xmppClient } = useWargame()

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      // ok, use mock data
      const roomMessages = mockRooms.find(r => r.id === room.roomName)
      if (roomMessages && roomMessages.messages) {
        setMessages(roomMessages.messages)
      }
    } else {
      // TODO: use real data
    }
  }, [room, xmppClient]);

  return { messages };
}