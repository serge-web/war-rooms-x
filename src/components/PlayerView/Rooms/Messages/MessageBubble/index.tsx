import React, { useState } from 'react'
import './index.css'
import { ChatMessage, FormMessage, GameMessage, Template } from '../../../../../types/rooms-d'
import { renderObjectContent } from './renderObjectContent'
import { useWargame } from '../../../../../contexts/WargameContext'

const renderMessage = (mType: string, jsonObject: object, templates: Template[]): React.ReactNode => {
  // special case. Messages from other clients may be plain text.  If they are, just return them
  if (typeof jsonObject === 'string') {
    return jsonObject
  }
  switch(mType) {
  case 'chat': {
    return (jsonObject as ChatMessage).value
  }  
  case 'form': {
    const form = jsonObject as FormMessage
    // replace the template id with the template name
    const template = form.templateId
    const templateName = templates.find(t => t.id === template)?.schema.title || template
    const newForm = {...form}
    newForm.templateId = templateName
    return renderObjectContent(newForm)
  }  
  default : {
    return renderObjectContent(jsonObject)
  }
  }
}

const MessageBubble: React.FC<{
  message: GameMessage
  isSelf: boolean
  templates: Template[]
}> = ({ message, isSelf, templates }) => {
  const [forceColor, setForceColor] = useState<string | undefined>(undefined)
  const { getForce } = useWargame()
  const from = message.details.senderName
  const fromForce = message.details.senderForce
  if (fromForce) {
    getForce(fromForce).then((force) => {
      setForceColor(force.color)
    })
  }
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
      {renderMessage(message.details.messageType,message.content, templates)}</div>
    <div className="message-timestamp">{message.details.timestamp}</div>
  </div>
)
}
export default MessageBubble