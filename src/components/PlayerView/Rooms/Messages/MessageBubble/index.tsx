import React from 'react'
import './index.css'
import { XMPPMessage } from '../../../../../types/rooms'

const MessageBubble: React.FC<{
  message: XMPPMessage
  isSelf: boolean
}> = ({ message, isSelf }) => {
  const from = message.sender.split('/')[1]
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
    >
      {!isSelf && <div className="sender-name">{from}</div>}
    <div className="message-content">{message.content}</div>
    <div className="message-timestamp">{message.timestamp}</div>
  </div>
)
}
export default MessageBubble