# Phase 4: Game Control & Admin Tools Test

'As an Admin Systems Developer, specializing in React Admin and game management, it is your goal to write tests that verify game control and admin functionality. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. Admin UI is properly scaffolded with react-admin
2. Game metadata configuration flows work correctly
3. Force and player creation functionality works as expected
4. Room setup and permissions management is implemented
5. Turn advancement controls for Game Control work properly
6. System events are logged to `__system_log`

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { XMPPProvider } from '../context/XMPPContext'
import AdminApp from '../components/admin/AdminApp'
import GameMetadataForm from '../components/admin/GameMetadataForm'
import ForceManagement from '../components/admin/ForceManagement'
import RoomConfiguration from '../components/admin/RoomConfiguration'
import GameControl from '../components/admin/GameControl'

// Mock XMPP and OpenFire service
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
            currentPhase: 'Planning'
          }
        }
      ])
    }
    return Promise.resolve([])
  }),
  subscribeToNode: jest.fn(),
  publishToNode: jest.fn(),
  createNode: jest.fn().mockResolvedValue(true)
}))

jest.mock('../services/openfire', () => ({
  createUser: jest.fn().mockResolvedValue({ success: true }),
  createGroup: jest.fn().mockResolvedValue({ success: true }),
  addUserToGroup: jest.fn().mockResolvedValue({ success: true }),
  createRoom: jest.fn().mockResolvedValue({ success: true }),
  configureRoom: jest.fn().mockResolvedValue({ success: true }),
  addRoomOccupant: jest.fn().mockResolvedValue({ success: true })
}))

// Mock server for REST API
const server = setupServer(
  rest.get('/api/admin/forces', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'blue', name: 'Blue Force', description: 'Friendly forces' },
        { id: 'red', name: 'Red Force', description: 'Enemy forces' },
        { id: 'white', name: 'White Force', description: 'Control team' }
      ])
    )
  }),
  rest.post('/api/admin/forces', (req, res, ctx) => {
    return res(ctx.json({ success: true, id: 'new-force-id' }))
  }),
  rest.get('/api/admin/players', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'player1', username: 'user1', force: 'blue', role: 'commander' },
        { id: 'player2', username: 'user2', force: 'red', role: 'commander' },
        { id: 'player3', username: 'admin', force: 'white', role: 'umpire' }
      ])
    )
  }),
  rest.post('/api/admin/players', (req, res, ctx) => {
    return res(ctx.json({ success: true, id: 'new-player-id' }))
  }),
  rest.get('/api/admin/rooms', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'room1', name: 'Planning Room', description: 'For planning operations', forces: ['blue', 'white'] },
        { id: 'room2', name: 'Intel Room', description: 'For intelligence sharing', forces: ['blue', 'red', 'white'] }
      ])
    )
  }),
  rest.post('/api/admin/rooms', (req, res, ctx) => {
    return res(ctx.json({ success: true, id: 'new-room-id' }))
  }),
  rest.post('/api/admin/game/advance-turn', (req, res, ctx) => {
    return res(ctx.json({ success: true, newTurn: 2, newPhase: 'Execution' }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Game Control & Admin Tools', () => {
  // Test admin app scaffolding
  test('renders admin app with navigation menu', async () => {
    render(
      <MemoryRouter>
        <XMPPProvider>
          <AdminApp />
        </XMPPProvider>
      </MemoryRouter>
    )
    
    // Verify admin UI components
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
    })
    
    // Check navigation menu items
    expect(screen.getByText(/game metadata/i)).toBeInTheDocument()
    expect(screen.getByText(/forces/i)).toBeInTheDocument()
    expect(screen.getByText(/players/i)).toBeInTheDocument()
    expect(screen.getByText(/rooms/i)).toBeInTheDocument()
    expect(screen.getByText(/game control/i)).toBeInTheDocument()
  })
  
  // Test game metadata configuration
  test('configures game metadata correctly', async () => {
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    render(
      <XMPPProvider>
        <GameMetadataForm />
      </XMPPProvider>
    )
    
    // Wait for form to load with initial data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Wargame')).toBeInTheDocument()
    })
    
    // Update form fields
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'Updated Wargame Name' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Updated description' } 
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify data was published to PubSub
    await waitFor(() => {
      expect(mockPublishToNode).toHaveBeenCalledWith(
        'game_metadata',
        expect.objectContaining({
          name: 'Updated Wargame Name',
          description: 'Updated description'
        })
      )
    })
  })
  
  // Test force management
  test('creates and manages forces', async () => {
    const mockCreateGroup = require('../services/openfire').createGroup
    
    render(
      <MemoryRouter>
        <XMPPProvider>
          <ForceManagement />
        </XMPPProvider>
      </MemoryRouter>
    )
    
    // Wait for forces to load
    await waitFor(() => {
      expect(screen.getByText('Blue Force')).toBeInTheDocument()
      expect(screen.getByText('Red Force')).toBeInTheDocument()
      expect(screen.getByText('White Force')).toBeInTheDocument()
    })
    
    // Click add force button
    fireEvent.click(screen.getByRole('button', { name: /add force/i }))
    
    // Fill in new force form
    fireEvent.change(screen.getByLabelText(/force id/i), { 
      target: { value: 'green' } 
    })
    fireEvent.change(screen.getByLabelText(/force name/i), { 
      target: { value: 'Green Force' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Neutral forces' } 
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify OpenFire group was created
    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith('green')
    })
  })
  
  // Test player management
  test('creates and assigns players to forces', async () => {
    const mockCreateUser = require('../services/openfire').createUser
    const mockAddUserToGroup = require('../services/openfire').addUserToGroup
    
    render(
      <MemoryRouter>
        <XMPPProvider>
          <ForceManagement />
        </XMPPProvider>
      </MemoryRouter>
    )
    
    // Navigate to players tab
    fireEvent.click(screen.getByRole('tab', { name: /players/i }))
    
    // Wait for players to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument()
      expect(screen.getByText('user2')).toBeInTheDocument()
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    // Click add player button
    fireEvent.click(screen.getByRole('button', { name: /add player/i }))
    
    // Fill in new player form
    fireEvent.change(screen.getByLabelText(/username/i), { 
      target: { value: 'newuser' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    })
    fireEvent.change(screen.getByLabelText(/force/i), { 
      target: { value: 'blue' } 
    })
    fireEvent.change(screen.getByLabelText(/role/i), { 
      target: { value: 'planner' } 
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify OpenFire user was created and added to group
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith('newuser', 'password123')
      expect(mockAddUserToGroup).toHaveBeenCalledWith('newuser', 'blue')
    })
  })
  
  // Test room configuration
  test('configures rooms with correct permissions', async () => {
    const mockCreateRoom = require('../services/openfire').createRoom
    const mockConfigureRoom = require('../services/openfire').configureRoom
    
    render(
      <MemoryRouter>
        <XMPPProvider>
          <RoomConfiguration />
        </XMPPProvider>
      </MemoryRouter>
    )
    
    // Wait for rooms to load
    await waitFor(() => {
      expect(screen.getByText('Planning Room')).toBeInTheDocument()
      expect(screen.getByText('Intel Room')).toBeInTheDocument()
    })
    
    // Click add room button
    fireEvent.click(screen.getByRole('button', { name: /add room/i }))
    
    // Fill in new room form
    fireEvent.change(screen.getByLabelText(/room id/i), { 
      target: { value: 'logistics' } 
    })
    fireEvent.change(screen.getByLabelText(/room name/i), { 
      target: { value: 'Logistics Room' } 
    })
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'For logistics coordination' } 
    })
    
    // Select forces with access
    fireEvent.click(screen.getByLabelText(/blue force/i))
    fireEvent.click(screen.getByLabelText(/white force/i))
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify OpenFire room was created and configured
    await waitFor(() => {
      expect(mockCreateRoom).toHaveBeenCalledWith('logistics')
      expect(mockConfigureRoom).toHaveBeenCalledWith(
        'logistics',
        expect.objectContaining({
          name: 'Logistics Room',
          description: 'For logistics coordination',
          accessGroups: ['blue', 'white']
        })
      )
    })
  })
  
  // Test game control turn advancement
  test('advances game turn and phase', async () => {
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    render(
      <XMPPProvider>
        <GameControl />
      </XMPPProvider>
    )
    
    // Wait for game state to load
    await waitFor(() => {
      expect(screen.getByText(/current turn: 1/i)).toBeInTheDocument()
      expect(screen.getByText(/current phase: planning/i)).toBeInTheDocument()
    })
    
    // Click advance turn button
    fireEvent.click(screen.getByRole('button', { name: /advance turn/i }))
    
    // Confirm in modal
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    
    // Verify game state was updated
    await waitFor(() => {
      expect(screen.getByText(/current turn: 2/i)).toBeInTheDocument()
      expect(screen.getByText(/current phase: execution/i)).toBeInTheDocument()
    })
    
    // Verify event was logged to system log
    expect(mockPublishToNode).toHaveBeenCalledWith(
      '__system_log',
      expect.objectContaining({
        type: 'turn_advanced',
        turn: 2,
        phase: 'Execution'
      })
    )
  })
  
  // Test system event logging
  test('logs system events to __system_log', async () => {
    const mockPublishToNode = require('../services/xmpp').publishToNode
    
    // Create a test component that triggers system events
    const SystemEventTrigger = () => {
      const triggerEvent = (eventType) => {
        require('../services/xmpp').publishToNode('__system_log', {
          type: eventType,
          timestamp: new Date().toISOString(),
          user: 'admin'
        })
      }
      
      return (
        <div>
          <button onClick={() => triggerEvent('game_created')}>Create Game</button>
          <button onClick={() => triggerEvent('force_added')}>Add Force</button>
          <button onClick={() => triggerEvent('player_added')}>Add Player</button>
        </div>
      )
    }
    
    render(
      <XMPPProvider>
        <SystemEventTrigger />
      </XMPPProvider>
    )
    
    // Trigger events
    fireEvent.click(screen.getByText('Create Game'))
    fireEvent.click(screen.getByText('Add Force'))
    fireEvent.click(screen.getByText('Add Player'))
    
    // Verify events were logged
    expect(mockPublishToNode).toHaveBeenCalledWith(
      '__system_log',
      expect.objectContaining({
        type: 'game_created',
        user: 'admin'
      })
    )
    
    expect(mockPublishToNode).toHaveBeenCalledWith(
      '__system_log',
      expect.objectContaining({
        type: 'force_added',
        user: 'admin'
      })
    )
    
    expect(mockPublishToNode).toHaveBeenCalledWith(
      '__system_log',
      expect.objectContaining({
        type: 'player_added',
        user: 'admin'
      })
    )
  })
})
```
