import React from 'react'
import './index.css'
import { Button } from 'antd'

const MessageInputForm: React.FC<{
  onSendMessage: (content: string) => void
  disabled: boolean
}> = ({ onSendMessage, disabled }) => (
  <form 
    className="message-input-form"
    onSubmit={(e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      const input = form.elements.namedItem('messageInput') as HTMLInputElement
      if (input.value.trim()) {
        onSendMessage(input.value)
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

export default MessageInputForm
