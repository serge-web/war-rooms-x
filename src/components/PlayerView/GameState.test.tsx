import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import GameState from './GameState'
import { mockGameState } from '../../mocks/MockGameState'

// Mock the useWargame hook
jest.mock('../../hooks/useWargame', () => ({
  useWargame: () => ({
    gameState: mockGameState,
    loading: false
  })
}))

describe('GameState Component', () => {
  test('renders game state information correctly', () => {
    const { getByTestId } = render(<GameState />)
    
    // Check if the component displays the turn number
    expect(getByTestId('turn-number')).toHaveTextContent(`Turn: ${mockGameState.turn}`)
    
    // Check if the component displays the current time in a formatted way
    const formattedDate = new Date(mockGameState.currentTime).toLocaleString()
    expect(getByTestId('current-time')).toHaveTextContent(`Time: ${formattedDate}`)
    
    // Check if the component displays the current phase
    expect(getByTestId('current-phase')).toHaveTextContent(`Phase: ${mockGameState.currentPhase}`)
  })

  test('renders loading state when data is not available', () => {
    // Override the mock to simulate loading state
    jest.requireMock('../../hooks/useWargame').useWargame = () => ({
      gameState: null,
      loading: true
    })

    const { getByText } = render(<GameState />)
    
    // Check if loading message is displayed
    expect(getByText('Loading game state...')).toBeInTheDocument()
  })
})
