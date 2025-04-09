import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { Message, RoomType } from '../../../../types/wargame'
import { useState, useEffect } from 'react'
import { mockRooms } from '../RoomsList/mockRooms'

const useRoom = (room: RoomType) => {
  const [messages, setMessages] = useState<Message[]>([])

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    // check for this room name in the mock messages
    // and set the messages and details
    const roomMessages = mockRooms.find(r => r.id === room.roomName)
    if (roomMessages && roomMessages.messages) {
      setMessages(roomMessages.messages)
    }
  }, [room]);

  return { messages };
}

const RoomContent: React.FC<{
  room: RoomType
}> = ({ room }) => {
  const { messages } = useRoom(room)
  
  return (
    <div className='room-content' data-testid={`room-content-${room.roomName}`}>
      <MessageList messages={messages} />
      <MessageInputForm 
        onSendMessage={(content) => console.log('Message sent:', content)} 
        disabled={false} 
      />
    </div>
  )
  
}

export default RoomContent
