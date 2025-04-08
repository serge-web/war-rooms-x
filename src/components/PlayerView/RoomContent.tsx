import React from 'react'
import MessageBubble, { Message } from './MessageBubble'
import MessageInputForm from './MessageInputForm'

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
    <div className='message-list'>
      {room.messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isSelf={message.sender === 'currentUser'} 
        />
      ))}
    </div>
    <MessageInputForm 
      onSendMessage={(content) => console.log('Message sent:', content)} 
      disabled={false} 
    />
  </div>
)

export default RoomContent
