import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('Skeleton Application', () => {
  test('renders login screen initially', () => {
    render(<App />)
    
    // Check that the login screen is displayed
    expect(screen.getByText(/login/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  test('navigates to player view when login button is clicked', () => {
    render(<App />)
    
    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    // Check that the player view is displayed
    expect(screen.getByTestId('player-view')).toBeInTheDocument()
    
    // Check that the layout components are present
    expect(screen.getByTestId('rooms-panel')).toBeInTheDocument()
    expect(screen.getByTestId('control-panel')).toBeInTheDocument()
    expect(screen.getByTestId('game-state')).toBeInTheDocument()
    expect(screen.getByTestId('user-details')).toBeInTheDocument()
    expect(screen.getByTestId('admin-messages')).toBeInTheDocument()
  })

  test('player view layout matches specifications', () => {
    render(<App />)
    
    // Click the login button to navigate to player view
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    // Get the layout components
    const controlPanel = screen.getByTestId('control-panel')
    const gameState = screen.getByTestId('game-state')
    const userDetails = screen.getByTestId('user-details')
    
    // Verify these elements exist (without storing references)
    screen.getByTestId('rooms-panel')
    screen.getByTestId('admin-messages')
    
    // Check that the control panel has the correct width
    expect(controlPanel).toHaveStyle('width: 200px')
    
    // Check that the game state has the correct height
    expect(gameState).toHaveStyle('height: 150px')
    
    // Check that the user details has the correct height
    expect(userDetails).toHaveStyle('height: 80px')
  })
})
