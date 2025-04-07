# Phase 1: Core Login + Game State Test

'As a Frontend Developer, specializing in React and XMPP integration, it is your goal to write tests that verify the login functionality and game state display. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create tests that verify:
1. Login UI and authentication flow work correctly with XMPP credentials
2. The `useWargame()` hook retrieves and displays game state correctly
3. Game turn, phase, and date are displayed in the right-hand panel
4. Login events are properly logged to the `__system_log`

## Test Implementation

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import Login from '../components/Login'
import { useWargame } from '../hooks/useWargame'
import { XMPPProvider } from '../context/XMPPContext'

// Mock XMPP server
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
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock the XMPP service
jest.mock('../services/xmpp', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  subscribeToNode: jest.fn(),
  publishToNode: jest.fn(),
  getNodeItems: jest.fn().mockResolvedValue([
    {
      id: 'game-state-1',
      content: {
        turn: 1,
        phase: 'Planning',
        date: '2025-04-07',
        status: 'active'
      }
    }
  ])
}))

describe('Login and Game State', () => {
  // Test login functionality
  test('allows user to login with valid credentials', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    // Verify successful login
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
    })
  })
  
  // Test useWargame hook
  test('useWargame hook retrieves game state correctly', async () => {
    const wrapper = ({ children }) => <XMPPProvider>{children}</XMPPProvider>
    
    const { result, waitForNextUpdate } = renderHook(() => useWargame(), { wrapper })
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true)
    
    // Wait for data to load
    await waitForNextUpdate()
    
    // Verify game state
    expect(result.current.loading).toBe(false)
    expect(result.current.gameState).toEqual({
      turn: 1,
      phase: 'Planning',
      date: '2025-04-07',
      status: 'active'
    })
  })
  
  // Test game state display
  test('displays game state in right-hand panel', async () => {
    const GameStatePanel = () => {
      const { gameState, loading } = useWargame()
      
      if (loading) return <div>Loading...</div>
      
      return (
        <div data-testid="game-state-panel">
          <div data-testid="turn">Turn: {gameState.turn}</div>
          <div data-testid="phase">Phase: {gameState.phase}</div>
          <div data-testid="date">Date: {gameState.date}</div>
        </div>
      )
    }
    
    render(
      <XMPPProvider>
        <GameStatePanel />
      </XMPPProvider>
    )
    
    // Initially loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('game-state-panel')).toBeInTheDocument()
    })
    
    // Verify game state display
    expect(screen.getByTestId('turn')).toHaveTextContent('Turn: 1')
    expect(screen.getByTestId('phase')).toHaveTextContent('Phase: Planning')
    expect(screen.getByTestId('date')).toHaveTextContent('Date: 2025-04-07')
  })
  
  // Test system logging
  test('logs login events to __system_log', async () => {
    const mockPublish = require('../services/xmpp').publishToNode
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
    
    // Login
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    // Verify log was published
    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(
        '__system_log',
        expect.objectContaining({
          type: 'login',
          user: 'testuser',
          force: 'blue'
        })
      )
    })
  })
})
```
