import { useState, useEffect, useRef } from 'react'
import { Message, RoomType } from '../../../types/rooms';
import { mockRooms } from './RoomsList/mockRooms';
import { useWargame } from '../../../contexts/WargameContext';
import { ThemeConfig } from 'antd';

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
        console.log('useRoom', messagesReceived.current)
        messagesReceived.current = true
        // join the room
        const fetchMessages = async () => {
          const joined = await xmppClient.joinRoom(room.roomName)
          console.log('joined', room.roomName, joined)
          const messages = await xmppClient.getRoomHistory(room.roomName)
          if (messages) {
            console.log('room messages', room.roomName, messages)
            setMessages(messages.map((message): Message => {
              return {
                id: message.id,
                content: message.body,
                sender: message.from,
                timestamp: message.timestamp.toISOString()
              }
            }))
          }
        }
        fetchMessages()
      }
    }
  }, [room, xmppClient]);

  return { messages, theme, canSubmit };
}