import React from 'react'
import MessageBubble from './MessageBubble'
import { Message } from './MessageBubble'
import { List } from 'antd'

interface MessageListProps {
  messages: Message[]
  currentUser?: string
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser = 'currentUser' 
}) => {
  const renderer = (message: Message) => (
    <MessageBubble 
      key={message.id} 
      message={message} 
      isSelf={message.sender === currentUser} 
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
