import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { Room } from '../../../../types/wargame'

const RoomContent: React.FC<{
  room: Room
}> = ({ room }) => (
  <div className='room-content' data-testid={`room-content-${room.id}`}>
    <MessageList messages={room.messages} />
    <MessageInputForm 
      onSendMessage={(content) => console.log('Message sent:', content)} 
      disabled={false} 
    />
  </div>
)

export default RoomContent
