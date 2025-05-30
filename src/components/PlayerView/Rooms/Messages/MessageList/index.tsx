import React from 'react'
import MessageBubble from '../MessageBubble'
import { List } from 'antd'
import './index.css'
import { GameMessage, Template } from '../../../../../types/rooms-d'
import { ForceConfigType } from '../../../../../types/wargame-d'

interface MessageListProps {
  messages: GameMessage[]
  currentUser: string
  templates: Template[]
  getForce: (forceId: string) => Promise<ForceConfigType>
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUser,
  templates,
  getForce
}) => {
  const renderer = (message: GameMessage) => (
    <MessageBubble 
      key={message.id} 
      message={message} 
      isSelf={message.details.senderId === currentUser} 
      templates={templates}
      getForce={getForce}
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
