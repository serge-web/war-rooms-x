import React from 'react'

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

const MessageBubble: React.FC<{
  message: Message
  isSelf: boolean
}> = ({ message, isSelf }) => (
  <div 
    data-testid={`message-${message.id}`} 
    className={`message-bubble ${isSelf ? 'self' : 'other'}`}
  >
    {!isSelf && <div className="sender-name">{message.sender}</div>}
    <div className="message-content">{message.content}</div>
    <div className="message-timestamp">{message.timestamp}</div>
  </div>
)

export default MessageBubble
