# Phase 7: Polish & Extensions Test

'As a UX Engineer, specializing in UI refinements and advanced features, it is your goal to write tests that verify UI polish and extension features. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. Tooltip information is properly displayed on room tabs
2. Unread message indicators are polished and functional
3. Structured message parameterization is supported
4. Image/file attachment support is prepared for future implementation
5. Hook APIs and message schemas are properly documented

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { XMPPProvider } from '../context/XMPPContext'
import { UserProvider } from '../context/UserContext'
import RoomTabs from '../components/RoomTabs'
import StructuredMessageForm from '../components/StructuredMessageForm'
import MessageInput from '../components/MessageInput'
import { useRooms, useRoom } from '../hooks/useRooms'
import { useTemplates } from '../hooks/useTemplates'

// Mock XMPP service
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getRooms: jest.fn().mockResolvedValue([
    { 
      id: 'room1', 
      name: 'Planning Room', 
      type: 'muc',
      metadata: { 
        description: 'For planning operations',
        participants: 5,
        lastActivity: '2025-04-07T14:30:00Z'
      },
      unread: 3
    },
    { 
      id: 'room2', 
      name: 'Intel Room', 
      type: 'muc',
      metadata: { 
        description: 'For intelligence sharing',
        participants: 3,
        lastActivity: '2025-04-07T13:15:00Z'
      },
      unread: 0
    }
  ]),
  getNodeItems: jest.fn().mockImplementation((nodeId) => {
    if (nodeId === 'templates') {
      return Promise.resolve([
        {
          id: 'template1',
          content: {
            id: 'sitrep',
            name: 'Situation Report',
            description: 'Standard situation report format',
            schema: {
              type: 'object',
              required: ['situation'],
              properties: {
                situation: { 
                  type: 'string', 
                  title: 'Current Situation',
                  template: 'The situation in {{location}} is {{status}}.'
                },
                location: {
                  type: 'string',
                  title: 'Location'
                },
                status: {
                  type: 'string',
                  title: 'Status',
                  enum: ['stable', 'deteriorating', 'improving']
                }
              }
            },
            uiSchema: {
              situation: { 'ui:widget': 'textarea' }
            }
          }
        }
      ])
    }
    return Promise.resolve([])
  }),
  getMessages: jest.fn().mockResolvedValue([
    { id: 'msg1', from: 'user1', body: 'Test message', timestamp: '2025-04-07T14:30:00Z' }
  ]),
  sendMessage: jest.fn().mockResolvedValue({
    id: 'new-msg-id',
    from: 'testuser',
    body: 'New message',
    timestamp: new Date().toISOString()
  }),
  uploadAttachment: jest.fn().mockResolvedValue({
    id: 'attachment-1',
    url: 'https://example.com/files/attachment.pdf',
    filename: 'attachment.pdf',
    contentType: 'application/pdf',
    size: 12345
  }),
  subscribeToNode: jest.fn(),
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
          <div data-testid={`tab-header-${tabId}`}>
            {tabNode.getName()}
            {tabNode.getExtraData().unread > 0 && (
              <span data-testid={`unread-badge-${tabId}`}>
                {tabNode.getExtraData().unread}
              </span>
            )}
          </div>
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
            getConfig: () => ({ roomId: 'room1' }),
            getExtraData: () => ({ 
              unread: 3,
              metadata: { 
                description: 'For planning operations',
                participants: 5,
                lastActivity: '2025-04-07T14:30:00Z'
              }
            })
          },
          {
            getId: () => 'room2',
            getName: () => 'Intel Room',
            getComponent: () => 'room',
            getConfig: () => ({ roomId: 'room2' }),
            getExtraData: () => ({ 
              unread: 0,
              metadata: { 
                description: 'For intelligence sharing',
                participants: 3,
                lastActivity: '2025-04-07T13:15:00Z'
              }
            })
          }
        ]
      }),
      doAction: jest.fn()
    }))
  }
}))

// Mock React JSON Schema Form
jest.mock('@rjsf/core', () => {
  return function MockForm(props) {
    return (
      <div data-testid="rjsf-form">
        <button 
          data-testid="submit-button" 
          onClick={() => props.onSubmit({ formData: props.formData })}
        >
          Submit
        </button>
        {Object.entries(props.schema.properties).map(([key, prop]) => (
          <div key={key} data-testid={`form-field-${key}`}>
            <label>{prop.title}</label>
            <input 
              data-testid={`input-${key}`}
              onChange={(e) => {
                const newFormData = { ...props.formData, [key]: e.target.value }
                props.onChange(newFormData)
              }}
            />
          </div>
        ))}
      </div>
    )
  }
})

describe('Polish & Extensions', () => {
  // Test tooltip info on room tabs
  test('displays tooltip information on room tabs', async () => {
    render(
      <XMPPProvider>
        <RoomTabs />
      </XMPPProvider>
    )
    
    // Wait for tabs to load
    await waitFor(() => {
      expect(screen.getByTestId('flex-layout')).toBeInTheDocument()
    })
    
    // Hover over tab to show tooltip
    fireEvent.mouseOver(screen.getByTestId('tab-header-room1'))
    
    // Verify tooltip content
    await waitFor(() => {
      expect(screen.getByText('For planning operations')).toBeInTheDocument()
      expect(screen.getByText('5 participants')).toBeInTheDocument()
      expect(screen.getByText(/last activity:/i)).toBeInTheDocument()
    })
  })
  
  // Test unread message indicators
  test('displays polished unread message indicators', async () => {
    render(
      <XMPPProvider>
        <RoomTabs />
      </XMPPProvider>
    )
    
    // Wait for tabs to load
    await waitFor(() => {
      expect(screen.getByTestId('flex-layout')).toBeInTheDocument()
    })
    
    // Verify unread badge on room1
    expect(screen.getByTestId('unread-badge-room1')).toBeInTheDocument()
    expect(screen.getByTestId('unread-badge-room1')).toHaveTextContent('3')
    
    // Verify no unread badge on room2
    expect(screen.queryByTestId('unread-badge-room2')).not.toBeInTheDocument()
    
    // Test marking as read
    const mockMarkAsRead = require('../services/xmpp').markAsRead
    
    // Simulate clicking on room1 tab to mark as read
    fireEvent.click(screen.getByTestId('tab-header-room1'))
    
    // Verify markAsRead was called
    expect(mockMarkAsRead).toHaveBeenCalledWith('room1')
  })
  
  // Test structured message parameterization
  test('supports structured message parameterization', async () => {
    render(
      <XMPPProvider>
        <StructuredMessageForm templateId="sitrep" roomId="room1" />
      </XMPPProvider>
    )
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
    
    // Fill in parameters
    fireEvent.change(screen.getByTestId('input-location'), { 
      target: { value: 'Sector 7' } 
    })
    
    fireEvent.change(screen.getByTestId('input-status'), { 
      target: { value: 'stable' } 
    })
    
    // Verify template field is updated with parameters
    await waitFor(() => {
      expect(screen.getByTestId('input-situation')).toHaveValue(
        'The situation in Sector 7 is stable.'
      )
    })
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'))
    
    // Verify message was sent with parameterized content
    const mockSendMessage = require('../services/xmpp').sendMessage
    expect(mockSendMessage).toHaveBeenCalledWith(
      'room1',
      'Situation Report',
      expect.objectContaining({
        templateId: 'sitrep',
        data: expect.objectContaining({
          situation: 'The situation in Sector 7 is stable.',
          location: 'Sector 7',
          status: 'stable'
        })
      })
    )
  })
  
  // Test file attachment support
  test('supports file attachments in messages', async () => {
    const mockUploadAttachment = require('../services/xmpp').uploadAttachment
    
    render(
      <XMPPProvider>
        <MessageInput roomId="room1" />
      </XMPPProvider>
    )
    
    // Create a mock file
    const file = new File(['test file content'], 'test.pdf', { type: 'application/pdf' })
    
    // Upload file
    const fileInput = screen.getByTestId('file-input')
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Verify file upload was initiated
    expect(mockUploadAttachment).toHaveBeenCalledWith(file)
    
    // Verify attachment preview is shown
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    // Type message text
    fireEvent.change(screen.getByPlaceholderText(/type a message/i), { 
      target: { value: 'Message with attachment' } 
    })
    
    // Send message
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    
    // Verify message was sent with attachment
    const mockSendMessage = require('../services/xmpp').sendMessage
    expect(mockSendMessage).toHaveBeenCalledWith(
      'room1',
      'Message with attachment',
      expect.objectContaining({
        attachments: [{
          id: 'attachment-1',
          url: 'https://example.com/files/attachment.pdf',
          filename: 'test.pdf',
          contentType: 'application/pdf',
          size: 12345
        }]
      })
    )
  })
  
  // Test hook API documentation
  test('verifies hook APIs are properly documented', async () => {
    // Import hook documentation
    const hookDocs = require('../docs/hook-api.json')
    
    // Verify documentation exists for all hooks
    expect(hookDocs).toHaveProperty('useWargame')
    expect(hookDocs).toHaveProperty('useRooms')
    expect(hookDocs).toHaveProperty('useRoom')
    expect(hookDocs).toHaveProperty('useForce')
    expect(hookDocs).toHaveProperty('useForces')
    expect(hookDocs).toHaveProperty('usePlayer')
    expect(hookDocs).toHaveProperty('useTemplates')
    expect(hookDocs).toHaveProperty('useTemplate')
    
    // Check documentation structure for a hook
    expect(hookDocs.useRoom).toHaveProperty('description')
    expect(hookDocs.useRoom).toHaveProperty('parameters')
    expect(hookDocs.useRoom).toHaveProperty('returns')
    expect(hookDocs.useRoom.returns).toHaveProperty('messages')
    expect(hookDocs.useRoom.returns).toHaveProperty('postMessage')
    expect(hookDocs.useRoom.returns).toHaveProperty('markAsRead')
  })
  
  // Test message schema documentation
  test('verifies message schemas are properly documented', async () => {
    // Import schema documentation
    const schemaDocs = require('../docs/message-schema.json')
    
    // Verify documentation exists for all message types
    expect(schemaDocs).toHaveProperty('plainMessage')
    expect(schemaDocs).toHaveProperty('structuredMessage')
    expect(schemaDocs).toHaveProperty('systemMessage')
    
    // Check schema structure for structured messages
    expect(schemaDocs.structuredMessage).toHaveProperty('properties')
    expect(schemaDocs.structuredMessage.properties).toHaveProperty('templateId')
    expect(schemaDocs.structuredMessage.properties).toHaveProperty('data')
    expect(schemaDocs.structuredMessage.properties).toHaveProperty('attachments')
  })
})
```
