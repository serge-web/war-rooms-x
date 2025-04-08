import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import '@testing-library/jest-dom'
import App from '../App'

describe('Skeleton Application', () => {
  test('renders login screen initially', () => {
    const { getByText, getByRole } = render(<App />)
    
    // Check that the login screen is displayed
    expect(getByText(/login/i)).toBeInTheDocument()
    expect(getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  test('navigates to player view when login button is clicked', () => {
    const { getByRole, getByTestId, getByText } = render(<App />)
    
    // Click the login button
    const loginButton = getByRole('button', { name: /login/i })
    userEvent.click(loginButton)
    
    // Check that the player view is displayed
    expect(getByTestId('player-view')).toBeInTheDocument()
    
    // Check that the layout components are present
    expect(getByText('Rooms')).toBeInTheDocument()
    expect(getByText('Game State')).toBeInTheDocument()
    expect(getByText('Admin Messages')).toBeInTheDocument()
    expect(getByText('User Details')).toBeInTheDocument()
  })

  test('player view layout matches specifications', () => {
    const { getByRole, getByText } = render(<App />)
    
    // Click the login button to navigate to player view
    const loginButton = getByRole('button', { name: /login/i })
    userEvent.click(loginButton)
    
    // Get the layout components by their content text
    const controlPanel = getByText('Game State').closest('aside')
    const gameState = getByText('Game State').closest('header')
    const adminMessages = getByText('Admin Messages').closest('main')
    const userDetails = getByText('User Details').closest('footer')
    
    // Check that the control panel has the correct width
    expect(controlPanel).toHaveStyle('width: 300px')
    
    // Check that the game state has the correct height
    expect(gameState).toHaveStyle('height: 120px')
    
    // Check that the user details has the correct height
    expect(userDetails).toHaveStyle('height: 100px')
    
    // Check that admin messages has flex properties for vertical expansion
    expect(adminMessages).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'auto'
    })
  })
})
