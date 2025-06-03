import React from 'react'
import './index.css'
import { Button } from 'antd'

import { MessageDetails } from '../../../../../types/rooms-d'

interface MessageInputFormProps {
  onSendMessage: (messageType: MessageDetails['messageType'], content: object) => void
  disabled: boolean
}

const MessageInputForm: React.FC<MessageInputFormProps> = ({ onSendMessage, disabled }) => {
  const send = (value: string) => {
    onSendMessage('chat', { text: value })
  }
  return (
  <form 
    className="message-input-form"
    onSubmit={(e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const input = form.elements.namedItem('messageInput') as HTMLInputElement
      if (input.value.trim()) {
        send(input.value)
        input.value = ''
      }
    }}
  >
    <input 
      type="text" 
      name="messageInput" 
      placeholder="Type a message..." 
      disabled={disabled} 
    />
    <Button type="primary" htmlType="submit" disabled={disabled}>Send</Button>
  </form>
  )
}

export default MessageInputForm
