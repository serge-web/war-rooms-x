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
    console.log('force', force)
    setForceColor(force.color)
  })
  console.log('message', message, fromForce)
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'}`}
    >
      {!isSelf && <div className="sender-name">{from}</div>}
    <div className="message-content" data-testid="message-content">
      [{forceColor}]{renderMessage(message.details.messageType,message.content)}</div>
    <div className="message-timestamp">{message.details.timestamp}</div>
  </div>
)
}
export default MessageBubble