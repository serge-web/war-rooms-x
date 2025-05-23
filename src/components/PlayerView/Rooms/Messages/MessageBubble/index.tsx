import React, { useState, useRef, useEffect } from 'react'
import { EditOutlined, CheckOutlined, CloseOutlined, CodeOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import JSONEditorModal from './JSONEditorModal'
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
  onEditMessage?: (messageId: string, newContent: string | object) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isSelf, 
  templates,
  onEditMessage 
}) => {
  // Debug logging
  console.log('MessageBubble render:', {
    messageId: message.id,
    isSelf,
    hasOnEditMessage: !!onEditMessage,
    messageType: message.details.messageType,
    content: message.content
  })
  const [forceColor, setForceColor] = useState<string | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [jsonContent, setJsonContent] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null)
  const { getForce } = useWargame()
  const from = message.details.senderName
  const fromForce = message.details.senderForce
  const isEditable = isSelf && !!onEditMessage
  const isChatMessage = message.details.messageType === 'chat'

  useEffect(() => {
    if (fromForce) {
      getForce(fromForce).then((force) => {
        setForceColor(force.color)
      })
    }
  }, [fromForce, getForce])
  
  // Initialize content when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      setEditedContent(
        message.details.messageType === 'chat' 
          ? (message.content as ChatMessage).value || ''
          : JSON.stringify(message.content, null, 2)
      )
    }
  }, [isEditing, message.content, message.details.messageType])
  
  // Initialize JSON content when opening the editor
  useEffect(() => {
    if (showJsonEditor && jsonEditorRef.current) {
      jsonEditorRef.current.focus()
      setJsonContent(JSON.stringify(message.content, null, 2))
    }
  }, [showJsonEditor, message.content])
  
  const handleEditClick = () => {
    setIsEditing(true)
  }
  
  const handleSave = () => {
    if (editedContent.trim() && onEditMessage) {
      if (message.details.messageType === 'chat') {
        onEditMessage(message.id, editedContent)
      } else {
        try {
          const parsedContent = JSON.parse(editedContent)
          onEditMessage(message.id, parsedContent)
        } catch (e) {
          console.error('Invalid JSON content', e)
          return
        }
      }
    }
    setIsEditing(false)
  }
  
  const handleSaveJson = () => {
    if (jsonContent.trim() && onEditMessage) {
      try {
        const parsedContent = JSON.parse(jsonContent)
        onEditMessage(message.id, parsedContent)
        setShowJsonEditor(false)
      } catch (e) {
        console.error('Invalid JSON content', e)
      }
    }
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
          {isEditable && !isEditing && !showJsonEditor && (
            <>
              <button 
                className="edit-button" 
                onClick={handleEditClick}
                aria-label="Edit message"
                title={isChatMessage ? 'Edit message' : 'Edit JSON'}
              >
                {isChatMessage ? <EditOutlined /> : <CodeOutlined />}
              </button>
            </>
          )}
          {/* {message.details.isEdited && <span className="edited-indicator">(edited)</span>} */}
        </div>
      </div>
      
      <JSONEditorModal
        visible={showJsonEditor}
        content={jsonContent}
        onSave={handleSaveJson}
        onCancel={() => setShowJsonEditor(false)}
      />
    </div>
  )
}
export default MessageBubble