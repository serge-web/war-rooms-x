# Phase 2: Room Interaction + Messaging Test

'As a Real-time Communication Specialist, specializing in XMPP and React, it is your goal to write tests that verify room interaction and messaging functionality. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. The `useRooms()` and `useRoom()` hooks function correctly
2. Tabs are properly displayed using FlexLayout
3. Message sending and live updates work as expected
4. Read/unread indicators function properly
5. Optimistic message posting is implemented
6. System rooms (`__system_*`) are hidden from the UI

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { XMPPProvider } from '../context/XMPPContext'
import { useRooms, useRoom } from '../hooks/useRooms'
import RoomTabs from '../components/RoomTabs'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

// Mock XMPP service
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getRooms: jest.fn().mockResolvedValue([
    { id: 'room1', name: 'Planning Room', type: 'muc' },
    { id: 'room2', name: 'Intel Room', type: 'muc' },
    { id: '__system_log', name: 'System Log', type: 'muc' }
  ]),
  getMessages: jest.fn().mockImplementation((roomId) => {
    if (roomId === 'room1') {
      return Promise.resolve([
        { id: 'msg1', from: 'user1', body: 'Hello', timestamp: '2025-04-07T14:30:00Z' },
        { id: 'msg2', from: 'user2', body: 'Hi there', timestamp: '2025-04-07T14:31:00Z' }
      ])
    }
    return Promise.resolve([])
  }),
  sendMessage: jest.fn().mockImplementation((roomId, message) => {
    return Promise.resolve({
      id: 'new-msg-id',
      from: 'testuser',
      body: message,
      timestamp: new Date().toISOString()
    })
  }),
  subscribeToRoom: jest.fn(),
  markAsRead: jest.fn()
}))

// Mock FlexLayout
jest.mock('flexlayout-react', () => ({
  Layout: ({ model, factory }) => {
    // Simple mock of FlexLayout that renders tabs based on the model
    const tabs = model.getRoot().getChildren().map(tabNode => {
      const tabId = tabNode.getId()
      return (
        <div key={tabId} data-testid={`tab-${tabId}`}>
          <div data-testid={`tab-header-${tabId}`}>{tabNode.getName()}</div>
          <div data-testid={`tab-content-${tabId}`}>
            {factory(tabNode)}
          </div>
        </div>
      )
    })
    
    return <div data-testid="flex-layout">{tabs}</div>
  },
  Model: {
    fromJson: jest.fn().mockImplementation(() => ({
      getRoot: () => ({
        getChildren: () => [
          { 
            getId: () => 'room1',
            getName: () => 'Planning Room',
            getComponent: () => 'room',
            getConfig: () => ({ roomId: 'room1' })
          },
          {
            getId: () => 'room2',
            getName: () => 'Intel Room',
            getComponent: () => 'room',
            getConfig: () => ({ roomId: 'room2' })
          }
        ]
      }),
      doAction: jest.fn()
    }))
  }
}))

describe('Room Interaction and Messaging', () => {
  // Test useRooms hook
  test('useRooms hook returns rooms correctly and filters system rooms', async () => {
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    const { result, waitForNextUpdate } = renderHook(() => useRooms(), { wrapper })
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true)
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Verify rooms data
    expect(result.current.loading).toBe(false)
    expect(result.current.rooms).toHaveLength(2) // Should not include __system_log
    expect(result.current.rooms[0].id).toBe('room1')
    expect(result.current.rooms[1].id).toBe('room2')
    expect(result.current.rooms.find(r => r.id === '__system_log')).toBeUndefined()
  })
  
  // Test useRoom hook
  test('useRoom hook returns room messages and functions', async () => {
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    const { result, waitForNextUpdate } = renderHook(() => useRoom('room1'), { wrapper })
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true)
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Verify room data
    expect(result.current.loading).toBe(false)
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].id).toBe('msg1')
    expect(result.current.postMessage).toBeInstanceOf(Function)
    expect(result.current.markAsRead).toBeInstanceOf(Function)
  })
  
  // Test room tabs display with FlexLayout
  test('renders room tabs using FlexLayout', async () => {
    render(
      <XMPPProvider>
        <RoomTabs />
      </XMPPProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('flex-layout')).toBeInTheDocument()
    })
    
    // Verify tabs are rendered
    expect(screen.getByTestId('tab-room1')).toBeInTheDocument()
    expect(screen.getByTestId('tab-header-room1')).toHaveTextContent('Planning Room')
    expect(screen.getByTestId('tab-room2')).toBeInTheDocument()
    expect(screen.getByTestId('tab-header-room2')).toHaveTextContent('Intel Room')
  })
  
  // Test message sending and optimistic updates
  test('sends messages and updates UI optimistically', async () => {
    const mockSendMessage = require('../services/xmpp').sendMessage
    
    // Render message input component
    render(
      <XMPPProvider>
        <MessageInput roomId="room1" />
        <MessageList roomId="room1" />
      </XMPPProvider>
    )
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there')).toBeInTheDocument()
    })
    
    // Type and send a new message
    fireEvent.change(screen.getByPlaceholderText(/type a message/i), { 
      target: { value: 'New test message' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    
    // Message should appear immediately (optimistic update)
    expect(screen.getByText('New test message')).toBeInTheDocument()
    
    // Verify the message was sent via the service
    expect(mockSendMessage).toHaveBeenCalledWith('room1', 'New test message')
  })
  
  // Test read/unread indicators
  test('tracks read/unread status correctly', async () => {
    const mockMarkAsRead = require('../services/xmpp').markAsRead
    
    const { result, waitForNextUpdate } = renderHook(
      () => ({ rooms: useRooms(), room: useRoom('room1') }),
      { wrapper: ({ children }) => <XMPPProvider>{children}</XMPPProvider> }
    )
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Mark room as read
    act(() => {
      result.current.room.markAsRead()
    })
    
    // Verify markAsRead was called
    expect(mockMarkAsRead).toHaveBeenCalledWith('room1')
    
    // Check that room is marked as read in the rooms list
    await waitForNextUpdate()
    const room1 = result.current.rooms.rooms.find(r => r.id === 'room1')
    expect(room1.unread).toBe(false)
  })
})
```
