import React from 'react'
import MessageBubble from '../MessageBubble'
import './index.css'
import { GameMessage, Template } from '../../../../../types/rooms-d'

interface MessageListProps {
  messages: GameMessage[]
  currentUser: string
  templates: Template[]
  onEditMessage?: (messageId: string, newContent: string | object) => void
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser,
  templates,
  onEditMessage
}) => {

  return (
    <div className='message-list'>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSelf={message.details.senderId === currentUser}
          templates={templates}
          onEditMessage={onEditMessage}
        />
      ))}
    </div>
  )
}

export default MessageList
