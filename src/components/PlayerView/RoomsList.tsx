import React, { useState } from 'react'
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { mockRooms } from '../../rooms-test/__mocks__/mockRooms'
import './RoomsList.css'

// Types for our components (matching the test file structure)
interface Room {
  id: string
  name: string
  unreadCount: number
  messages: Message[]
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

// Component for displaying a message bubble
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

// Component for message input form
const MessageInputForm: React.FC<{
  onSendMessage: (message: string) => void
  disabled: boolean
}> = ({ onSendMessage, disabled }) => (
  <form 
    data-testid="message-input-form"
    className="message-input-form"
    onSubmit={(e) => {
      e.preventDefault()
      const input = e.currentTarget.querySelector('input[name="messageInput"]') as HTMLInputElement
      onSendMessage(input.value)
      input.value = ''
    }}
  >
    <input 
      type="text" 
      name="messageInput" 
      placeholder="Type a message..." 
      disabled={disabled} 
    />
    <button type="submit" disabled={disabled}>Send</button>
  </form>
)

// Component for room content
const RoomContent: React.FC<{
  room: Room
}> = ({ room }) => (
  <div className="room-content" data-testid={`room-content-${room.id}`}>
    <div className="message-list">
      {room.messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isSelf={message.sender === 'currentUser'} 
        />
      ))}
    </div>
    <MessageInputForm 
      onSendMessage={(content) => console.log('Message sent:', content)} 
      disabled={false} 
    />
  </div>
)

const RoomsList: React.FC = () => {
  // Create a FlexLayout model for the rooms
  const createModel = (): FlexLayout.Model => {
    const jsonModel: FlexLayout.IJsonModel = {
      global: {},
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: mockRooms.filter((room: Room) => !room.id.startsWith('__')).map(room => ({
              type: 'tab',
              name: room.name,
              component: 'room',
              config: { roomId: room.id }
            }))
          }
        ]
      }
    }
    return FlexLayout.Model.fromJson(jsonModel)
  }

  const [model] = useState<FlexLayout.Model>(createModel())

  // Factory function to render components based on type
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    const config = node.getConfig()
    
    if (component === 'room') {
      const roomId = config.roomId
      const room = mockRooms.find(r => r.id === roomId)
      
      if (room) {
        return <RoomContent room={room} />
      }
    }
    
    return <div>Component not found</div>
  }

  return (
    <div className="rooms-list-container">
      <h2>Available Rooms</h2>
      <div className="flex-layout-container">
        <FlexLayout.Layout 
          model={model} 
          factory={factory}
        />
      </div>
    </div>
  )
}

export default RoomsList
