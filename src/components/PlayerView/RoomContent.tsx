import React from 'react'
import { Message } from './MessageBubble'
import MessageInputForm from './MessageInputForm'
import MessageList from './MessageList'

export interface Room {
  id: string
  name: string
  unreadCount: number
  messages: Message[]
}

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
