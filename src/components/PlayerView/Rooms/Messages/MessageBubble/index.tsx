import React from 'react'
import './index.css'
import { ChatMessage, GameMessage } from '../../../../../types/rooms'
import { renderObjectContent } from './renderObjectContent'

const renderMessage = (mType: string, jsonObject: object): React.ReactNode => {
  switch(mType) {
  case 'chat': {
    return (jsonObject as ChatMessage).value
  }  
  default : {
    return renderObjectContent(jsonObject)
  }
  }
}

const MessageBubble: React.FC<{
  message: GameMessage
  isSelf: boolean
}> = ({ message, isSelf }) => {
  const from = message.details.senderName
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
    >
      {!isSelf && <div className="sender-name">{from}</div>}
    <div className="message-content" data-testid="message-content">{renderMessage(message.details.messageType,message.content)}</div>
    <div className="message-timestamp">{message.details.timestamp}</div>
  </div>
)
}
export default MessageBubble