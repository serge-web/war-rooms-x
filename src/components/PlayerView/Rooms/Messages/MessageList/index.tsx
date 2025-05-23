import React from 'react'
import MessageBubble from '../MessageBubble'
import { List } from 'antd'
import './index.css'
import { GameMessage, Template } from '../../../../../types/rooms-d'

interface MessageListProps {
  messages: GameMessage[]
  currentUser: string
  templates: Template[]
  onEditMessage?: (messageId: string, newContent: string) => void
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser,
  templates,
  onEditMessage
}) => {
  const renderer = (message: GameMessage) => (
    <MessageBubble 
      key={message.id} 
      message={message} 
      isSelf={message.details.senderId === currentUser} 
      templates={templates}
      onEditMessage={onEditMessage}
    />
  )
  return (
    <List className='message-list' 
      dataSource={messages} 
      renderItem={renderer}
    />
  )
}

export default MessageList
