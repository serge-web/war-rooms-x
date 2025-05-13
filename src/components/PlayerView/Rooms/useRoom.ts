import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { RoomType, User, UserError, GameMessage, MessageDetails, OnlineUser } from '../../../types/rooms-d';
import { useWargame } from '../../../contexts/WargameContext';
import { ThemeConfig } from 'antd';
import { SendMessageResult } from '../../../services/types';
import { ReceivedMessage } from 'stanza/protocol';
import { useIndexedDBData } from '../../../hooks/useIndexedDBData';
import * as localforage from 'localforage'
import { prefixKey } from '../../../types/constants';
import { RRoom } from '../../AdminView/raTypes-d';
import { UserConfigType } from '../../../types/wargame-d';

export const useRoom = (room: RoomType) => {
  const { xmppClient, gameState, playerDetails, getPlayerDetails } = useWargame()
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [users, setUsers] = useState<OnlineUser[]>([])
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
        // and the users
        const thisRoomUsers = thisRoom?.dummyUsers || []
        setUsers(thisRoomUsers)
        setCanSubmit(true)
      }
    } else {
      // TODO: handle room theme, if present
      // TODO: handle other room metadata (esp. permissions)
      if (xmppClient.mucService && messagesReceived.current === null) {
        messagesReceived.current = true

        const updateUser = async (from: string, available: boolean) => {
          if (available) {
            // add to list, if not present
            setUsers(prev => {
              // check if we know about this user
              const user = prev.find(user => user.id === from)
              if (user) {
                // known user, just update their presece
                user.isOnline = true
                return [...prev]
              } else {
                return [...prev, { id: from, isOnline: true, name: undefined, force: undefined }]
              }
            })
          } else {
            // mark this user as not present
            setUsers(prev => prev.map(user => user.id === from ? { ...user, isOnline: false } : user))
          }
        }
        
        // subscribe to presence changes for this room
        xmppClient.subscribeToPresence(room.roomName, (from: string, available: boolean) => {
          updateUser(from, available)
        })
        // join the room
        const fetchMessages = async () => {
          await xmppClient.joinRoom(room.roomName, messageHandler)
        }
        fetchMessages().then(() => {
          // now get the users
          const getPlayerDetailsTop = async(jid: string): Promise<UserConfigType | undefined> => {
            const res = await getPlayerDetails(jid)
            return res
          }
          const fetchUsers = async () => {
            const users = await xmppClient.getRoomMembers(room.roomName)
            const getUserDetails = users.map((user: User) => {
              const jid = user.jid.split('/')[1].split('@')[0]
              return getPlayerDetailsTop(jid)
            })
            Promise.all(getUserDetails).then((details) => {
              const onlineUsers = details.map((detail: UserConfigType | undefined, index: number): OnlineUser => {
                const jid = users[index].jid.split('/')[1].split('@')[0]
                return detail ? { id: jid, isOnline: true, name: detail.name, force: detail.forceId } : { id: jid, isOnline: true, name: '', force: '' }
              })
              setUsers(onlineUsers.filter((user) => user !== undefined))
            })
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
  }, [room, xmppClient, loading, mockRooms, getPlayerDetails]);

  const presenceVisibility = useMemo(() => {
    if (!room.description)
      return 'all'
    try {
      const config = JSON.parse(room.description)
      if (!config.specifics?.presenceVisibility)
        return 'all'
      return config.specifics.presenceVisibility
    } catch {
      return 'all'
    }
  }, [room])

  return { messages, users, theme, canSubmit, sendMessage, error, clearError, presenceVisibility };
}