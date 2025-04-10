import { useState, useEffect, useRef } from 'react'
import { Message, RoomType } from '../../../types/rooms';
import { mockRooms } from './RoomsList/mockRooms';
import { useWargame } from '../../../contexts/WargameContext';
import { ThemeConfig } from 'antd';
import { RoomMessage } from '../../../services/types';

export const useRoom = (room: RoomType) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [theme, setTheme] = useState<ThemeConfig | undefined>(undefined)
  const [canSubmit, setCanSubmit] = useState(true)
  const { xmppClient } = useWargame()
  const messagesReceived = useRef<boolean | null>(null)

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      // ok, use mock data
      const thisRoom = mockRooms.find(r => r.id === room.roomName)
      if (thisRoom && thisRoom.messages) {
        setMessages(thisRoom.messages)
      }
      // does room have theme?
      if (thisRoom && thisRoom.theme) {
        setTheme(thisRoom.theme)
      }
      setCanSubmit(Math.random() > 0.5)
    } else {
      // TODO: use real data
      if (xmppClient.mucService && messagesReceived.current === null) {
        messagesReceived.current = true
        // join the room
        const fetchMessages = async () => {
          xmppClient.onRoomMessage(room.roomName, (message: RoomMessage) => {
            setMessages(prev => [...prev, {
              id: message.id,
              content: message.body,
              sender: message.from,
              timestamp: message.timestamp.toISOString()
            }])
          })
          await xmppClient.joinRoom(room.roomName)
        }
        fetchMessages()
      }
    }
  }, [room, xmppClient]);

  return { messages, theme, canSubmit };
}