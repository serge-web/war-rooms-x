import { useState, useEffect } from 'react'
import { Message, RoomType } from '../types/rooms';
import { mockRooms } from '../components/PlayerView/Rooms/RoomsList/mockRooms';
import { useWargame } from '../contexts/WargameContext';

export const useRoom = (room: RoomType) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { useMock } = useWargame()

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (!useMock) return
    // check for this room name in the mock messages
    // and set the messages and details
    const roomMessages = mockRooms.find(r => r.id === room.roomName)
    if (roomMessages && roomMessages.messages) {
      setMessages(roomMessages.messages)
    }
  }, [room, useMock]);

  return { messages };
}