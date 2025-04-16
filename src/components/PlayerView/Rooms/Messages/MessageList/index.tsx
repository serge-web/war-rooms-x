import React from 'react'
import MessageBubble from '../MessageBubble'
import { List } from 'antd'
import './index.css'
import { GameMessage } from '../../../../../types/rooms-d'

interface MessageListProps {
  messages: GameMessage[]
  currentUser: string
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser
}) => {
  const renderer = (message: GameMessage) => (
    <MessageBubble 
      key={message.id} 
      message={message} 
      isSelf={message.details.senderId === currentUser} 
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
