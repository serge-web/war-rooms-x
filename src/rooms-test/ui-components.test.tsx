import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

// Types for our components
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

// Mock components - these will be implemented later
const RoomTab: React.FC<{
  room: Room
  isActive: boolean
  onSelect: () => void
}> = ({ room, isActive, onSelect }) => (
  <div 
    data-testid={`room-tab-${room.id}`} 
    className={`room-tab ${isActive ? 'active' : ''}`}
    onClick={onSelect}
  >
    {room.name}
    {room.unreadCount > 0 && <span className="unread-badge">{room.unreadCount}</span>}
  </div>
)

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

// Import mock data
import { mockRooms } from './__mocks__/mockRooms'

describe('RoomTab Component', () => {
  test('renders correctly with room data', () => {
    const mockRoom = mockRooms[0]
    const handleSelect = jest.fn()
    
    render(<RoomTab room={mockRoom} isActive={false} onSelect={handleSelect} />)
    
    const { getByTestId } = render(<RoomTab room={mockRoom} isActive={false} onSelect={handleSelect} />)
    const roomTab = getByTestId(`room-tab-${mockRoom.id}`)
    
    // Check room name is displayed
    expect(roomTab).toHaveTextContent(mockRoom.name)
    
    // Check unread count badge is displayed
    expect(roomTab).toHaveTextContent(mockRoom.unreadCount.toString())
    
    // Check it doesn't have active class
    expect(roomTab).not.toHaveClass('active')
  })
  
  test('displays active state correctly', () => {
    const mockRoom = mockRooms[0]
    const handleSelect = jest.fn()
    
    render(<RoomTab room={mockRoom} isActive={true} onSelect={handleSelect} />)
    
    const { getByTestId } = render(<RoomTab room={mockRoom} isActive={false} onSelect={handleSelect} />)
    const roomTab = getByTestId(`room-tab-${mockRoom.id}`)
    
    // Check it has active class
    expect(roomTab).toHaveClass('active')
  })
  
  test('does not display unread badge when count is 0', () => {
    const mockRoom = { ...mockRooms[1] } // Room with unreadCount: 0
    const handleSelect = jest.fn()
    
    render(<RoomTab room={mockRoom} isActive={false} onSelect={handleSelect} />)
    
    const { getByTestId } = render(<RoomTab room={mockRoom} isActive={false} onSelect={handleSelect} />)
    const roomTab = getByTestId(`room-tab-${mockRoom.id}`)
    const unreadBadge = roomTab.querySelector('.unread-badge')
    
    expect(unreadBadge).toBeNull()
  })
})

describe('MessageBubble Component', () => {
  test('renders self message correctly', () => {
    const selfMessage = mockRooms[0].messages[1] // Message from currentUser
    
    render(<MessageBubble message={selfMessage} isSelf={true} />)
    
    const { getByTestId } = render(<MessageBubble message={selfMessage} isSelf={true} />)
    const messageBubble = getByTestId(`message-${selfMessage.id}`)
    
    // Check message content is displayed
    expect(messageBubble).toHaveTextContent(selfMessage.content)
    
    // Check timestamp is displayed
    expect(messageBubble).toHaveTextContent(selfMessage.timestamp)
    
    // Check it has self class
    expect(messageBubble).toHaveClass('self')
    
    // Self messages should not display sender name
    const senderName = messageBubble.querySelector('.sender-name')
    expect(senderName).toBeNull()
  })
  
  test('renders other user message correctly', () => {
    const otherMessage = mockRooms[0].messages[0] // Message from Commander
    
    render(<MessageBubble message={otherMessage} isSelf={false} />)
    
    const { getByTestId } = render(<MessageBubble message={otherMessage} isSelf={false} />)
    const messageBubble = getByTestId(`message-${otherMessage.id}`)
    
    // Check message content is displayed
    expect(messageBubble).toHaveTextContent(otherMessage.content)
    
    // Check timestamp is displayed
    expect(messageBubble).toHaveTextContent(otherMessage.timestamp)
    
    // Check sender name is displayed
    expect(messageBubble).toHaveTextContent(otherMessage.sender)
    
    // Check it has other class
    expect(messageBubble).toHaveClass('other')
  })
})

describe('MessageInputForm Component', () => {
  test('renders correctly', () => {
    const handleSend = jest.fn()
    
    render(<MessageInputForm onSendMessage={handleSend} disabled={false} />)
    
    const { getByTestId } = render(<MessageInputForm onSendMessage={handleSend} disabled={false} />)
    const form = getByTestId('message-input-form')
    const input = form.querySelector('input')
    const button = form.querySelector('button')
    
    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Send')
    expect(input).not.toBeDisabled()
    expect(button).not.toBeDisabled()
  })
  
  test('disables input and button when disabled prop is true', () => {
    const handleSend = jest.fn()
    
    render(<MessageInputForm onSendMessage={handleSend} disabled={true} />)
    
    const { getByTestId } = render(<MessageInputForm onSendMessage={handleSend} disabled={false} />)
    const form = getByTestId('message-input-form')
    const input = form.querySelector('input')
    const button = form.querySelector('button')
    
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })
  
  test('calls onSendMessage with input value when form is submitted', async () => {
    const user = userEvent.setup()
    const handleSend = jest.fn()
    
    const { getByTestId } = render(<MessageInputForm onSendMessage={handleSend} disabled={false} />)
    const form = getByTestId('message-input-form')
    const input = form.querySelector('input')
    
    // Type in the input
    await user.type(input, 'Test message')
    
    // Submit the form
    await user.click(form.querySelector('button'))
    
    expect(handleSend).toHaveBeenCalledWith('Test message')
    expect(input.value).toBe('') // Input should be cleared after submission
  })
})

describe('RoomContent Component', () => {
  test('renders message list and input form', () => {
    const mockRoom = mockRooms[0]
    
    render(<RoomContent room={mockRoom} />)
    
    // We don't need to use roomContent variable, so we can remove it
    
    // Check that all messages are rendered
    mockRoom.messages.forEach(message => {
      const messageElement = document.querySelector(`[data-testid="message-${message.id}"]`)
      expect(messageElement).toBeInTheDocument()
    })
    
    // Check that the message input form is rendered
    const messageForm = document.querySelector('[data-testid="message-input-form"]')
    expect(messageForm).toBeInTheDocument()
  })
  
  test('renders correct layout with message list and input form', () => {
    const mockRoom = mockRooms[0]
    
    render(<RoomContent room={mockRoom} />)
    
    const roomContentElement = document.querySelector(`[data-testid="room-content-${mockRoom.id}"]`)
    expect(roomContentElement).toBeTruthy()
    const messageList = roomContentElement?.querySelector('.message-list')
    const messageForm = document.querySelector('[data-testid="message-input-form"]')
    
    // Check that the message list and form exist
    expect(messageList).toBeInTheDocument()
    expect(messageForm).toBeInTheDocument()
    
    // Layout checks would be better with getComputedStyle in a browser environment
    // For jest tests, we can check the DOM structure
    expect(roomContentElement?.firstChild).toBe(messageList)
    expect(roomContentElement?.lastChild).toBe(messageForm)
  })
})
