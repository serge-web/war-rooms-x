import React from 'react'
import './index.css'
import { GameMessage } from '../../../../../types/rooms'

const MessageBubble: React.FC<{
  message: GameMessage
  isSelf: boolean
}> = ({ message, isSelf }) => {
  const from = message.details.senderName
  const renderMessage = (jsonObject: object): string => {
    return JSON.stringify(jsonObject)
  }
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
    >
      {!isSelf && <div className="sender-name">{from}</div>}
    <div className="message-content">{renderMessage(message.content)}</div>
    <div className="message-timestamp">{message.details.timestamp}</div>
  </div>
)
}
export default MessageBubble