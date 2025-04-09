import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../../../../hooks/useRoom'
import { RoomType } from '../../../../types/rooms'

interface RoomProps {
  room: RoomType
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
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
