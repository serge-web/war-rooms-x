import React, { useState, useRef, useEffect } from 'react'
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Input } from 'antd'
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

interface MessageBubbleProps {
  message: GameMessage
  isSelf: boolean
  templates: Template[]
  onEditMessage?: (messageId: string, newContent: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isSelf, 
  templates,
  onEditMessage 
}) => {
  const [forceColor, setForceColor] = useState<string | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { getForce } = useWargame()
  const from = message.details.senderName
  const fromForce = message.details.senderForce
  const isEditable = isSelf && message.details.messageType === 'chat' && onEditMessage
  
  useEffect(() => {
    if (fromForce) {
      getForce(fromForce).then((force) => {
        setForceColor(force.color)
      })
    }
  }, [fromForce, getForce])
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Set initial content when starting to edit
      setEditedContent((message.content as ChatMessage).value || '')
    }
  }, [isEditing, message.content])
  
  const handleEditClick = () => {
    setIsEditing(true)
  }
  
  const handleSave = () => {
    if (editedContent.trim() && onEditMessage) {
      onEditMessage(message.id, editedContent)
    }
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }
  return (
    <div 
      data-testid={`message-${message.id}`} 
      className={`message-bubble ${isSelf ? 'self' : 'other'} ${isEditable ? 'editable' : ''}`}
      style={forceColor ? {
        borderLeft: `5px solid ${forceColor}`,
        paddingLeft: '10px'
      } : undefined}
    >
      <div className="message-header">
        {!isSelf && <div className="sender-name">{from}</div>}
      </div>
      
      {isEditing ? (
        <div className="edit-container">
          <Input.TextArea
            ref={inputRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoSize={{ minRows: 1, maxRows: 6 }}
            className="edit-input"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-button" aria-label="Save changes">
              <CheckOutlined />
            </button>
            <button onClick={handleCancel} className="cancel-button" aria-label="Cancel editing">
              <CloseOutlined />
            </button>
          </div>
        </div>
      ) : (
        <div className="message-content" data-testid="message-content">
          {renderMessage(message.details.messageType, message.content, templates)}
        </div>
      )}
      
      <div className="message-footer">
        <div className="message-timestamp">
          {message.details.timestamp}
          {isEditable && !isEditing && (
            <button 
              className="edit-button" 
              onClick={handleEditClick}
              aria-label="Edit message"
            >
              <EditOutlined />
            </button>
          )}
          {/* {message.details.isEdited && <span className="edited-indicator">(edited)</span>} */}
        </div>
      </div>
    </div>
  )
}
export default MessageBubble