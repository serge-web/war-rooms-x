import React from 'react'
import MessageBubble from './MessageBubble'
import { Message } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  currentUser?: string
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser = 'currentUser' 
}) => {
  return (
    <div className='message-list'>
      {messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isSelf={message.sender === currentUser} 
        />
      ))}
    </div>
  )
}

export default MessageList
