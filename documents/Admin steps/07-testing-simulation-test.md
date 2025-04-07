# Phase 6: Testing & Simulation Test

'As a Test Automation Engineer, specializing in simulation environments and mock services, it is your goal to write tests that verify testing and simulation capabilities. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. The simulation/testing app functions correctly
2. Mock XMPP and REST test harness works as expected
3. Unit tests for all hooks pass
4. Utility functions for room and template setup work properly

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockXMPPProvider } from '../test/MockXMPPProvider'
import SimulationApp from '../simulation/SimulationApp'
import { useWargame } from '../hooks/useWargame'
import { useRooms, useRoom } from '../hooks/useRooms'
import { useTemplates, useTemplate } from '../hooks/useTemplates'
import { setupTestRoom, setupTestTemplate } from '../test/testUtils'

// Mock server for REST API
const server = setupServer(
  rest.post('/api/auth', (req, res, ctx) => {
    const { username, password } = req.body
    
    if (username === 'testuser' && password === 'password') {
      return res(
        ctx.json({
          success: true,
          token: 'mock-token',
          user: { id: 'user-1', username: 'testuser', force: 'blue' }
        })
      )
    }
    
    return res(ctx.status(401), ctx.json({ success: false, message: 'Invalid credentials' }))
  }),
  
  rest.get('/api/admin/forces', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'blue', name: 'Blue Force', description: 'Friendly forces' },
        { id: 'red', name: 'Red Force', description: 'Enemy forces' },
        { id: 'white', name: 'White Force', description: 'Control team' }
      ])
    )
  }),
  
  rest.get('/api/admin/players', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'player1', username: 'user1', force: 'blue', role: 'commander' },
        { id: 'player2', username: 'user2', force: 'red', role: 'commander' },
        { id: 'player3', username: 'admin', force: 'white', role: 'umpire' }
      ])
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock XMPP service for testing
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  getNodeItems: jest.fn().mockImplementation((nodeId) => {
    if (nodeId === 'game_metadata') {
      return Promise.resolve([
        {
          id: 'metadata',
          content: {
            name: 'Test Wargame',
            description: 'Test wargame description',
            startDate: '2025-04-01',
            endDate: '2025-04-10',
            currentTurn: 1,
            currentPhase: 'Planning',
            version: '1.0.0'
          }
        }
      ])
    } else if (nodeId === 'templates') {
      return Promise.resolve([
        {
          id: 'template1',
          content: {
            id: 'sitrep',
            name: 'Situation Report',
            schema: {
              type: 'object',
              properties: {
                situation: { type: 'string', title: 'Current Situation' }
              }
            }
          }
        }
      ])
    }
    return Promise.resolve([])
  }),
  getRooms: jest.fn().mockResolvedValue([
    { id: 'room1', name: 'Planning Room', type: 'muc' },
    { id: 'room2', name: 'Intel Room', type: 'muc' }
  ]),
  getMessages: jest.fn().mockResolvedValue([
    { id: 'msg1', from: 'user1', body: 'Test message', timestamp: '2025-04-07T14:30:00Z' }
  ]),
  sendMessage: jest.fn().mockResolvedValue({
    id: 'new-msg-id',
    from: 'testuser',
    body: 'New message',
    timestamp: new Date().toISOString()
  }),
  subscribeToNode: jest.fn(),
  subscribeToRoom: jest.fn(),
  publishToNode: jest.fn(),
  createNode: jest.fn().mockResolvedValue(true)
}))

describe('Testing & Simulation', () => {
  // Test simulation app
  test('renders simulation app with controls', async () => {
    render(
      <MemoryRouter>
        <MockXMPPProvider>
          <SimulationApp />
        </MockXMPPProvider>
      </MemoryRouter>
    )
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText(/simulation environment/i)).toBeInTheDocument()
    })
    
    // Verify simulation controls
    expect(screen.getByText(/user simulation/i)).toBeInTheDocument()
    expect(screen.getByText(/message simulation/i)).toBeInTheDocument()
    expect(screen.getByText(/game state control/i)).toBeInTheDocument()
  })
  
  // Test user simulation
  test('simulates user login and actions', async () => {
    render(
      <MemoryRouter>
        <MockXMPPProvider>
          <SimulationApp />
        </MockXMPPProvider>
      </MemoryRouter>
    )
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText(/user simulation/i)).toBeInTheDocument()
    })
    
    // Select user to simulate
    fireEvent.change(screen.getByLabelText(/select user/i), { 
      target: { value: 'user1' } 
    })
    
    // Start simulation
    fireEvent.click(screen.getByRole('button', { name: /start simulation/i }))
    
    // Verify user is simulated
    await waitFor(() => {
      expect(screen.getByText(/simulating: user1/i)).toBeInTheDocument()
    })
    
    // Verify force is displayed
    expect(screen.getByText(/force: blue/i)).toBeInTheDocument()
  })
  
  // Test message simulation
  test('simulates message sending between users', async () => {
    const mockSendMessage = require('../services/xmpp').sendMessage
    
    render(
      <MemoryRouter>
        <MockXMPPProvider>
          <SimulationApp />
        </MockXMPPProvider>
      </MemoryRouter>
    )
    
    // Navigate to message simulation tab
    fireEvent.click(screen.getByRole('tab', { name: /message simulation/i }))
    
    // Wait for tab to load
    await waitFor(() => {
      expect(screen.getByText(/simulate messages/i)).toBeInTheDocument()
    })
    
    // Select source user
    fireEvent.change(screen.getByLabelText(/from user/i), { 
      target: { value: 'user1' } 
    })
    
    // Select target room
    fireEvent.change(screen.getByLabelText(/to room/i), { 
      target: { value: 'room1' } 
    })
    
    // Enter message
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: 'Simulated test message' } 
    })
    
    // Send message
    fireEvent.click(screen.getByRole('button', { name: /send simulated message/i }))
    
    // Verify message was sent
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        'room1',
        'Simulated test message',
        expect.objectContaining({ simulatedFrom: 'user1' })
      )
    })
  })
  
  // Test game state simulation
  test('simulates game state changes', async () => {
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    render(
      <MemoryRouter>
        <MockXMPPProvider>
          <SimulationApp />
        </MockXMPPProvider>
      </MemoryRouter>
    )
    
    // Navigate to game state control tab
    fireEvent.click(screen.getByRole('tab', { name: /game state control/i }))
    
    // Wait for tab to load
    await waitFor(() => {
      expect(screen.getByText(/control game state/i)).toBeInTheDocument()
    })
    
    // Change turn
    fireEvent.change(screen.getByLabelText(/turn/i), { 
      target: { value: '2' } 
    })
    
    // Change phase
    fireEvent.change(screen.getByLabelText(/phase/i), { 
      target: { value: 'Execution' } 
    })
    
    // Update game state
    fireEvent.click(screen.getByRole('button', { name: /update game state/i }))
    
    // Verify game state was updated
    await waitFor(() => {
      expect(mockPublishToNode).toHaveBeenCalledWith(
        'game_metadata',
        expect.objectContaining({
          currentTurn: 2,
          currentPhase: 'Execution'
        })
      )
    })
  })
  
  // Test mock XMPP provider
  test('MockXMPPProvider provides test context correctly', async () => {
    const wrapper = ({ children }) => <MockXMPPProvider>{children}</MockXMPPProvider>
    
    // Test useWargame hook
    const { result: wargameResult, waitForNextUpdate: waitForWargame } = renderHook(
      () => useWargame(),
      { wrapper }
    )
    
    // Wait for data to load
    await waitForWargame()
    
    // Verify game state
    expect(wargameResult.current.gameState).toEqual({
      name: 'Test Wargame',
      description: 'Test wargame description',
      startDate: '2025-04-01',
      endDate: '2025-04-10',
      currentTurn: 1,
      currentPhase: 'Planning',
      version: '1.0.0'
    })
    
    // Test useRooms hook
    const { result: roomsResult, waitForNextUpdate: waitForRooms } = renderHook(
      () => useRooms(),
      { wrapper }
    )
    
    // Wait for data to load
    await waitForRooms()
    
    // Verify rooms data
    expect(roomsResult.current.rooms).toHaveLength(2)
    expect(roomsResult.current.rooms[0].id).toBe('room1')
    expect(roomsResult.current.rooms[1].id).toBe('room2')
  })
  
  // Test utility functions
  test('setupTestRoom creates test room correctly', async () => {
    const mockCreateNode = require('../services/xmpp').createNode
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    // Call setup function
    await setupTestRoom({
      id: 'test-room',
      name: 'Test Room',
      description: 'Room for testing',
      forces: ['blue', 'white']
    })
    
    // Verify room was created
    expect(mockCreateNode).toHaveBeenCalledWith('test-room')
    expect(mockPublishToNode).toHaveBeenCalledWith(
      'test-room',
      expect.objectContaining({
        type: 'room_metadata',
        name: 'Test Room',
        description: 'Room for testing',
        forces: ['blue', 'white']
      })
    )
  })
  
  test('setupTestTemplate creates test template correctly', async () => {
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    // Call setup function
    await setupTestTemplate({
      id: 'test-template',
      name: 'Test Template',
      description: 'Template for testing',
      schema: {
        type: 'object',
        properties: {
          testField: { type: 'string', title: 'Test Field' }
        }
      },
      permissions: {
        rooms: ['room1'],
        roles: ['blue'],
        phases: ['Planning']
      }
    })
    
    // Verify template was created
    expect(mockPublishToNode).toHaveBeenCalledWith(
      'templates',
      expect.objectContaining({
        id: 'test-template',
        name: 'Test Template',
        description: 'Template for testing',
        schema: expect.objectContaining({
          properties: expect.objectContaining({
            testField: expect.anything()
          })
        }),
        permissions: expect.objectContaining({
          rooms: ['room1'],
          roles: ['blue'],
          phases: ['Planning']
        })
      })
    )
  })
  
  // Test all hooks with mock provider
  test('all hooks function correctly with mock provider', async () => {
    const wrapper = ({ children }) => <MockXMPPProvider>{children}</MockXMPPProvider>
    
    // Test useRoom hook
    const { result: roomResult, waitForNextUpdate: waitForRoom } = renderHook(
      () => useRoom('room1'),
      { wrapper }
    )
    
    // Wait for data to load
    await waitForRoom()
    
    // Verify room data
    expect(roomResult.current.messages).toHaveLength(1)
    expect(roomResult.current.messages[0].id).toBe('msg1')
    expect(roomResult.current.postMessage).toBeInstanceOf(Function)
    
    // Test useTemplates hook
    const { result: templatesResult, waitForNextUpdate: waitForTemplates } = renderHook(
      () => useTemplates(),
      { wrapper }
    )
    
    // Wait for data to load
    await waitForTemplates()
    
    // Verify templates data
    expect(templatesResult.current.templates).toHaveLength(1)
    expect(templatesResult.current.templates[0].id).toBe('sitrep')
    
    // Test useTemplate hook
    const { result: templateResult, waitForNextUpdate: waitForTemplate } = renderHook(
      () => useTemplate('sitrep'),
      { wrapper }
    )
    
    // Wait for data to load
    await waitForTemplate()
    
    // Verify template data
    expect(templateResult.current.template).toBeDefined()
    expect(templateResult.current.template.id).toBe('sitrep')
    expect(templateResult.current.template.name).toBe('Situation Report')
  })
})
```
