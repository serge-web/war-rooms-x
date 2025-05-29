import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { RoomType, User, UserInfo, GameMessage, MessageDetails, OnlineUser, RoomDetails, PresenceVisibility, ChatMessage } from '../../../types/rooms-d';
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
  const [infoModal, setInfoModal] = useState<UserInfo | null>(null)
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')

  const clearInfoModal = () => {
    setInfoModal(null)
  }

  const editMessage = useCallback(async (messageId: string, newContent: object) => {
    const existingMessageId = messageId
    const updateMessage = (msg: GameMessage, content: object): GameMessage => ({
      ...msg,
      content: content as object | ChatMessage,
      details: {
        ...msg.details,
        editedAt: new Date().toISOString()
      }
    })
    
    if (xmppClient === undefined) {
      console.log('editMessage: xmppClient is undefined')
    } else if (xmppClient === null) {
        // Local mock update for development
      setMessages(prev => prev.map(msg => 
        msg.id === existingMessageId ? updateMessage(msg, newContent) : msg
      ))
    } else {
      if (xmppClient && !xmppClient.connected) {
        console.log('editMessage: xmppClient is not connected')
        return
      }
      try {
        // Get the original message
        const originalMessage = messages.find(msg => msg.id === existingMessageId)
        if (!originalMessage) {
          console.error('Original message not found:', existingMessageId)
          return
        }

        // Create the corrected message with the same ID as the original
        const correctedMessage: GameMessage = {
          ...originalMessage,
          content: newContent as object | ChatMessage,
          details: {
            ...originalMessage.details,
            editedAt: new Date().toISOString()
          }
        }

        // Send the corrected message using the `replace` MUC service
        const result = await xmppClient.replaceRoomMessage(originalMessage, newContent)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send corrected message')
        }

        // Update local state optimistically
        setMessages(prev => prev.map(msg => 
          msg.id === existingMessageId ? correctedMessage : msg
        ))

      } catch (error) {
        console.error('Error editing message:', error)
        setInfoModal({
          title: 'Error Editing Message',
          message: 'Failed to update the message. Please try again.',
          type: 'error'
        })
      }
    }
  }, [messages, xmppClient, setInfoModal])

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
    if (xmppClient && xmppClient.mucServiceUrl) {
      const sendMessage = async (message: GameMessage) => {
        const res: SendMessageResult = (await xmppClient.sendRoomMessage(message))
        if (res && !res.success) {
          setInfoModal({title:'Message sending error', message: 'Error sending message:' + res.error, type: 'error'})
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
    const robustMessage = (message: ReceivedMessage): GameMessage => {
      try {
        const msg = JSON.parse(message.body as string)
        return msg
      } catch {
        return {id: message.id || '', details: {messageType: 'chat', senderId: message.from, senderName: message.from, senderForce: '', turn: '', phase: '', timestamp: new Date().toISOString(), channel: room.roomName}, content: message.body as unknown as object}
      }
    }
    const messageHandler = (message: ReceivedMessage): void => {
      if (message.body !== undefined) {
        setMessages(prev => {
          // check message not already present
          const existingMessage = prev.find(m => m.id === message.id)
          if (existingMessage) {
            return prev
          }
          return [...prev, robustMessage(message)]
        })
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
      if (xmppClient.mucServiceUrl && messagesReceived.current === null) {
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
              const jid = user.jid.includes('/') ? user.jid.split('/')[1].split('@')[0] : user.jid
              return getPlayerDetailsTop(jid)
            })
            Promise.all(getUserDetails).then((details) => {
              const onlineUsers = details.map((detail: UserConfigType | undefined, index: number): OnlineUser => {
                const thisUser = users[index]
                const jid = thisUser.jid.includes('/') ? thisUser.jid.split('/')[1].split('@')[0] : thisUser.jid
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

  const presenceVisibility: PresenceVisibility = useMemo(() => {
    if (!room.description)
      return 'all'
    try {
      const config = JSON.parse(room.description) as RoomDetails
      if (!config.presenceVisibility)
        return 'all'
      return config.presenceVisibility
    } catch {
      return 'all'
    }
  }, [room])

  return { messages, users, theme, canSubmit, sendMessage, infoModal, setInfoModal, presenceVisibility, clearInfoModal, editMessage };
}