import React from 'react'
import './index.css'
import { Message } from '../../../../../types/rooms'

const MessageBubble: React.FC<{
  message: Message
  isSelf: boolean
}> = ({ message, isSelf }) => {
  const from = message.sender.split('/')[1]
  const userName = from.split('@')[0]
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
    >
      {!isSelf && <div className="sender-name">{userName}</div>}
    <div className="message-content">{message.content}</div>
    <div className="message-timestamp">{message.timestamp}</div>
  </div>
)
}
export default MessageBubble