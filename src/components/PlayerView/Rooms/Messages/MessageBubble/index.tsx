import React, { useState } from 'react'
import './index.css'
import { ChatMessage, GameMessage } from '../../../../../types/rooms-d'
import { renderObjectContent } from './renderObjectContent'
import { useWargame } from '../../../../../contexts/WargameContext'

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
  const [forceColor, setForceColor] = useState<string | undefined>(undefined)
  const from = message.details.senderName
  const fromForce = message.details.senderForce
  useWargame().getForce(fromForce).then((force) => {
    setForceColor(force.color)
  })
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
      style={forceColor ? {
        borderLeft: `5px solid ${forceColor}`,
        paddingLeft: '10px'
      } : undefined}
    >
      {!isSelf && <div className="sender-name">{from}</div>}
    <div className="message-content" data-testid="message-content">
      {renderMessage(message.details.messageType,message.content)}</div>
    <div className="message-timestamp">{message.details.timestamp}</div>
  </div>
)
}
export default MessageBubble