import { useState, useEffect, useRef, useCallback } from 'react'
import { RoomType, User, UserError, GameMessage, MessageDetails } from '../../../types/rooms-d';
import { useWargame } from '../../../contexts/WargameContext';
import { ThemeConfig } from 'antd';
import { SendMessageResult } from '../../../services/types';
import { usePlayerDetails } from '../UserDetails/usePlayerDetails';
import { ReceivedMessage } from 'stanza/protocol';
import { useIndexedDBData } from '../../../hooks/useIndexedDBData';
import localforage from 'localforage';
import { prefixKey } from '../../../types/constants';
import { RRoom } from '../../AdminView/raTypes-d';

export const useRoom = (room: RoomType) => {
  const { xmppClient, gameState } = useWargame()
  const [messages, setMessages] = useState<GameMessage[]>([])
  const { playerDetails } = usePlayerDetails()
  const [users, setUsers] = useState<User[]>([])
  const [theme, setTheme] = useState<ThemeConfig | undefined>(undefined)
  const [canSubmit, setCanSubmit] = useState(true)
  const messagesReceived = useRef<boolean | null>(null)
  const [error, setError] = useState<UserError | null>(null)
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')

  const clearError = () => {
    setError(null)
  }

  // TODO - also handle details, extract from the room description
  const sendMessage = useCallback((messageType: MessageDetails['messageType'], content: object) => {
    const message: GameMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      details: {
        messageType,
        senderId: playerDetails?.id || '',
        senderName: playerDetails?.role || '',
        senderForce: playerDetails?.forceId || '',
        turn: gameState?.turn || '',
        phase: gameState?.currentPhase || '',
        timestamp: new Date().toISOString(),
        channel: room.roomName
      },
      content
    }
    if (xmppClient && xmppClient.mucService) {
      const sendMessage = async (message: GameMessage) => {
        const res: SendMessageResult = (await xmppClient.sendRoomMessage(message))
        if (res && !res.success) {
          setError({title:'Message sending error', message: 'Error sending message:' + res.error})
        }  
      }
      sendMessage(message)
    } else if (xmppClient === null) {
      setMessages(prev => [...prev, message])
      // also save to indexed db.  The db root is in useIndexedDBData
      // get the room object from indexed
      const mockRoom = mockRooms?.find(r => r.id === room.roomName)
      if (mockRoom) {
        const existingMessages = mockRoom.dummyMessages || []
        mockRoom.dummyMessages = [...existingMessages, message]
        // save the room object back to indexed db
        localforage.setItem(`${prefixKey}chatrooms`, mockRooms)
      }

    }
  }, [xmppClient, room, gameState, playerDetails, mockRooms])

  useEffect(() => {
    const messageHandler = (message: ReceivedMessage): void => {
      if (message.body !== undefined) {
        setMessages(prev => [...prev, JSON.parse(message.body as string) as GameMessage])
      }
    }
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      if (!loading) {
        // ok, use mock data
        const rooms = mockRooms as RRoom[]
        const thisRoom = rooms.find(r => r.id === room.roomName)
        if (thisRoom && thisRoom.dummyMessages) {
          setMessages(thisRoom.dummyMessages)
        }
        // does room have theme?
        if (thisRoom && thisRoom.dummyTheme) {
          setTheme(thisRoom.dummyTheme)
        }
        setCanSubmit(true)
      }
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
  }, [room, xmppClient, loading, mockRooms]);

  return { messages, users, theme, canSubmit, sendMessage, error, clearError };
}