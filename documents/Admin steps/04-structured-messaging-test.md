# Phase 3: Structured Messaging Test

'As a Form UI Specialist, specializing in React JSON Schema Form and structured data, it is your goal to write tests that verify structured messaging functionality. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. The `templates` collection in PubSub is properly set up
2. The `useTemplates()` and `useTemplate()` hooks function correctly
3. RJSF integration for structured message UI works as expected
4. Structured messages are rendered in outline form in the chat history
5. Message templates are restricted by room/role/phase

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { XMPPProvider } from '../context/XMPPContext'
import { useTemplates, useTemplate } from '../hooks/useTemplates'
import { useRoom } from '../hooks/useRooms'
import TemplateMessageForm from '../components/TemplateMessageForm'
import StructuredMessage from '../components/StructuredMessage'

// Mock XMPP service
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
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
              required: ['situation', 'enemyForces', 'friendlyForces'],
              properties: {
                situation: { type: 'string', title: 'Current Situation' },
                enemyForces: { type: 'string', title: 'Enemy Forces' },
                friendlyForces: { type: 'string', title: 'Friendly Forces' }
              }
            },
            uiSchema: {
              situation: { 'ui:widget': 'textarea' },
              enemyForces: { 'ui:widget': 'textarea' },
              friendlyForces: { 'ui:widget': 'textarea' }
            },
            permissions: {
              rooms: ['room1', 'room2'],
              roles: ['blue', 'white'],
              phases: ['Planning', 'Execution']
            }
          }
        },
        {
          id: 'template2',
          content: {
            id: 'order',
            name: 'Movement Order',
            description: 'Order to move forces',
            schema: {
              type: 'object',
              required: ['unit', 'destination', 'timeline'],
              properties: {
                unit: { type: 'string', title: 'Unit' },
                destination: { type: 'string', title: 'Destination' },
                timeline: { type: 'string', title: 'Timeline' }
              }
            },
            permissions: {
              rooms: ['room1'],
              roles: ['blue'],
              phases: ['Planning']
            }
          }
        }
      ])
    }
    return Promise.resolve([])
  }),
  subscribeToNode: jest.fn(),
  publishToNode: jest.fn(),
  sendMessage: jest.fn().mockImplementation((roomId, message, metadata) => {
    return Promise.resolve({
      id: 'new-msg-id',
      from: 'testuser',
      body: message,
      metadata,
      timestamp: new Date().toISOString()
    })
  }),
  getMessages: jest.fn().mockImplementation((roomId) => {
    if (roomId === 'room1') {
      return Promise.resolve([
        { 
          id: 'msg1', 
          from: 'user1', 
          body: 'Regular message', 
          timestamp: '2025-04-07T14:30:00Z' 
        },
        { 
          id: 'msg2', 
          from: 'user2', 
          body: 'Situation Report', 
          timestamp: '2025-04-07T14:31:00Z',
          metadata: {
            templateId: 'sitrep',
            data: {
              situation: 'All quiet in sector 7',
              enemyForces: 'No enemy activity detected',
              friendlyForces: 'Patrols operating as normal'
            }
          }
        }
      ])
    }
    return Promise.resolve([])
  })
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

describe('Structured Messaging', () => {
  // Test useTemplates hook
  test('useTemplates hook returns all available templates', async () => {
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    const { result, waitForNextUpdate } = renderHook(() => useTemplates(), { wrapper })
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true)
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Verify templates data
    expect(result.current.loading).toBe(false)
    expect(result.current.templates).toHaveLength(2)
    expect(result.current.templates[0].id).toBe('sitrep')
    expect(result.current.templates[1].id).toBe('order')
  })
  
  // Test useTemplate hook
  test('useTemplate hook returns specific template by ID', async () => {
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    const { result, waitForNextUpdate } = renderHook(() => useTemplate('sitrep'), { wrapper })
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true)
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Verify template data
    expect(result.current.loading).toBe(false)
    expect(result.current.template).toBeDefined()
    expect(result.current.template.id).toBe('sitrep')
    expect(result.current.template.name).toBe('Situation Report')
    expect(result.current.template.schema).toBeDefined()
    expect(result.current.template.permissions).toBeDefined()
  })
  
  // Test template form rendering with RJSF
  test('renders structured message form using RJSF', async () => {
    render(
      <XMPPProvider>
        <TemplateMessageForm templateId="sitrep" roomId="room1" />
      </XMPPProvider>
    )
    
    // Wait for template to load
    await waitFor(() => {
      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
    
    // Verify form fields
    expect(screen.getByTestId('form-field-situation')).toBeInTheDocument()
    expect(screen.getByTestId('form-field-enemyForces')).toBeInTheDocument()
    expect(screen.getByTestId('form-field-friendlyForces')).toBeInTheDocument()
  })
  
  // Test sending structured message
  test('sends structured message with template data', async () => {
    const mockSendMessage = require('../services/xmpp').sendMessage
    
    render(
      <XMPPProvider>
        <TemplateMessageForm templateId="sitrep" roomId="room1" />
      </XMPPProvider>
    )
    
    // Wait for template to load
    await waitFor(() => {
      expect(screen.getByTestId('rjsf-form')).toBeInTheDocument()
    })
    
    // Fill in form fields
    fireEvent.change(screen.getByTestId('input-situation'), { 
      target: { value: 'Test situation' } 
    })
    fireEvent.change(screen.getByTestId('input-enemyForces'), { 
      target: { value: 'Test enemy forces' } 
    })
    fireEvent.change(screen.getByTestId('input-friendlyForces'), { 
      target: { value: 'Test friendly forces' } 
    })
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'))
    
    // Verify message was sent with correct metadata
    expect(mockSendMessage).toHaveBeenCalledWith(
      'room1',
      'Situation Report',
      {
        templateId: 'sitrep',
        data: {
          situation: 'Test situation',
          enemyForces: 'Test enemy forces',
          friendlyForces: 'Test friendly forces'
        }
      }
    )
  })
  
  // Test structured message rendering
  test('renders structured messages in outline form', async () => {
    render(
      <XMPPProvider>
        <StructuredMessage 
          message={{
            id: 'msg2',
            from: 'user2',
            body: 'Situation Report',
            timestamp: '2025-04-07T14:31:00Z',
            metadata: {
              templateId: 'sitrep',
              data: {
                situation: 'All quiet in sector 7',
                enemyForces: 'No enemy activity detected',
                friendlyForces: 'Patrols operating as normal'
              }
            }
          }}
        />
      </XMPPProvider>
    )
    
    // Verify structured message rendering
    expect(screen.getByText('Situation Report')).toBeInTheDocument()
    expect(screen.getByText('Current Situation')).toBeInTheDocument()
    expect(screen.getByText('All quiet in sector 7')).toBeInTheDocument()
    expect(screen.getByText('Enemy Forces')).toBeInTheDocument()
    expect(screen.getByText('No enemy activity detected')).toBeInTheDocument()
    expect(screen.getByText('Friendly Forces')).toBeInTheDocument()
    expect(screen.getByText('Patrols operating as normal')).toBeInTheDocument()
  })
  
  // Test template permissions filtering
  test('filters templates based on permissions', async () => {
    // Mock current user context
    jest.mock('../context/UserContext', () => ({
      useUser: () => ({
        force: 'blue',
        role: 'commander'
      })
    }))
    
    // Mock game state
    jest.mock('../hooks/useWargame', () => ({
      useWargame: () => ({
        gameState: {
          phase: 'Planning'
        }
      })
    }))
    
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    // Get available templates for room1
    const { result, waitForNextUpdate } = renderHook(
      () => {
        const { templates } = useTemplates()
        return {
          availableTemplates: templates.filter(t => 
            t.permissions.rooms.includes('room1') &&
            t.permissions.roles.includes('blue') &&
            t.permissions.phases.includes('Planning')
          )
        }
      },
      { wrapper }
    )
    
    // Wait for templates to load
    await waitForNextUpdate()
    
    // Both templates should be available for room1, blue force, Planning phase
    expect(result.current.availableTemplates).toHaveLength(2)
    
    // Change room to room2
    const { result: result2, waitForNextUpdate: waitForNextUpdate2 } = renderHook(
      () => {
        const { templates } = useTemplates()
        return {
          availableTemplates: templates.filter(t => 
            t.permissions.rooms.includes('room2') &&
            t.permissions.roles.includes('blue') &&
            t.permissions.phases.includes('Planning')
          )
        }
      },
      { wrapper }
    )
    
    // Wait for templates to load
    await waitForNextUpdate2()
    
    // Only sitrep should be available for room2
    expect(result2.current.availableTemplates).toHaveLength(1)
    expect(result2.current.availableTemplates[0].id).toBe('sitrep')
  })
})
```
