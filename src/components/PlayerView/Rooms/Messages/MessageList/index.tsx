import React from 'react'
import MessageBubble from '../MessageBubble'
import { List } from 'antd'
import './index.css'
import { XMPPMessage } from '../../../../../types/rooms'

interface MessageListProps {
  messages: XMPPMessage[]
  currentUser?: string
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser = 'currentUser' 
}) => {
  const renderer = (message: XMPPMessage) => (
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
