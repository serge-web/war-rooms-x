import { useState, useEffect, useRef, useCallback } from 'react'
import { Message, RoomType, User, UserError } from '../../../types/rooms';
import { mockRooms } from './RoomsList/mockRooms';
import { useWargame } from '../../../contexts/WargameContext';
import { ThemeConfig } from 'antd';
import { RoomMessage, SendMessageResult } from '../../../services/types';

export const useRoom = (room: RoomType) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [theme, setTheme] = useState<ThemeConfig | undefined>(undefined)
  const [canSubmit, setCanSubmit] = useState(true)
  const { xmppClient } = useWargame()
  const messagesReceived = useRef<boolean | null>(null)
  const [error, setError] = useState<UserError | null>(null)

  const clearError = () => {
    setError(null)
  }

  // TODO - also handle details, extract from the room description
  const sendMessage = useCallback((message: string) => {
    if (xmppClient && xmppClient.mucService) {
      const sendMessage = async (message: string) => {
        const res: SendMessageResult = (await xmppClient.sendRoomMessage(room.roomName, message))
        if (res && !res.success) {
          setError({title:'Message sending error', message: 'Error sending message:' + res.error})
        }  
      }
      sendMessage(message)
    } else if (xmppClient === null) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        content: message,
        sender: 'mock',
        timestamp: new Date().toISOString(),
        isHistory: false
      }])
    }
  }, [xmppClient, room])

  useEffect(() => {
    const messageHandler = (message: RoomMessage) => {
      setMessages(prev => [...prev, {
        id: message.id,
        content: message.body,
        sender: message.from,
        timestamp: message.timestamp.toISOString()
      }])
    }
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
      // TODO: handle room theme, if present
      // TODO: handle other room metadata (esp. permissions)
      if (xmppClient.mucService && messagesReceived.current === null) {
        messagesReceived.current = true
        // join the room
        const fetchMessages = async () => {
          await xmppClient.joinRoom(room.roomName, messageHandler)
        }
        fetchMessages().then(() => {
          // now get the users
          const fetchUsers = async () => {
            const users = await xmppClient.getRoomMembers(room.roomName)
            setUsers(users)
          }
          fetchUsers()
        })
      }
    }
    return () => {
      // TODO: we should reinstate this code, but it is getting called too many times
      // possibly related to useEffect cleanup running more than once in dev code
      // if (xmppClient && xmppClient.mucService) {
      //   xmppClient.leaveRoom(room.roomName, messageHandler)
      // }
    }
  }, [room, xmppClient]);

  return { messages, users, theme, canSubmit, sendMessage, error, clearError };
}