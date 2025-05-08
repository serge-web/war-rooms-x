import { renderHook, act } from '@testing-library/react'
import { useGameState } from '../../components/PlayerView/GameState/useGameState'
import { GamePropertiesType, GameStateType } from '../../types/wargame-d'
import { XMPPService } from '../../services/XMPPService'
import * as localforage from 'localforage'
import { prefixKey, LINEAR_TURNS } from '../../types/constants'

// Mock the usePubSub hook
jest.mock('../../hooks/usePubSub', () => ({
  usePubSub: jest.fn()
}))

// Mock the useIndexedDBData hook
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: jest.fn()
}))

// Mock localforage
jest.mock('localforage', () => ({
  setItem: jest.fn()
}))

// Import the mocked modules
import { usePubSub } from '../../hooks/usePubSub'
import { useIndexedDBData } from '../../hooks/useIndexedDBData'

// Cast the mocked functions to the correct types
const mockUsePubSub = usePubSub as jest.MockedFunction<typeof usePubSub>
const mockUseIndexedDBData = useIndexedDBData as jest.MockedFunction<typeof useIndexedDBData>
const mockLocalforageSetItem = localforage.setItem as jest.MockedFunction<typeof localforage.setItem>

// Mock game state data
const mockGameState: GameStateType = {
  turn: '1',
  currentPhase: 'planning',
  currentTime: '2023-01-01T00:00:00.000Z'
}

const mockGameProperties: GamePropertiesType = {
  name: 'Test Game',
  startTime: '2023-01-01T00:00:00.000Z',
  interval: '1d',
  turnType: LINEAR_TURNS
}

// Mock RGameState (combined state for RA data provider)
const mockRGameState = {
  id: 'game1',
  name: 'Test Game',
  turn: '1',
  currentPhase: 'planning',
  currentTime: '2023-01-01T00:00:00.000Z',
  startTime: '2023-01-01T00:00:00.000Z',
  interval: '1d',
  turnType: LINEAR_TURNS
}

describe('useGameState hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation for useIndexedDBData
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    })
    
    // Default mock implementation for usePubSub
    mockUsePubSub.mockReturnValue({
      document: null,
      updateDocument: jest.fn().mockResolvedValue({ success: true })
    })
  })

  it('should return null gameState when waiting for login', () => {
    // Set up mocks for undefined xmppClient (waiting for login)
    const xmppClient = undefined
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Verify initial state is null
    expect(result.current.gameState).toBeNull()
  })

  it('should load mock game state when xmppClient is null', () => {
    // Set up mocks for null xmppClient (offline mode)
    const xmppClient = null
    
    // Mock useIndexedDBData to return mock game state
    mockUseIndexedDBData.mockReturnValue({
      data: [mockRGameState],
      loading: false,
      error: null
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Verify game state is loaded from mock data
    expect(result.current.gameState).toEqual(mockGameState)
  })

  it('should handle loading state correctly', () => {
    // Set up mocks for null xmppClient and loading state
    const xmppClient = null
    
    // Mock useIndexedDBData to be in loading state
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: true,
      error: null
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Verify game state is null during loading
    expect(result.current.gameState).toBeNull()
  })

  it('should load game state from PubSub when xmppClient is available', () => {
    // Set up mocks for available xmppClient
    const xmppClient = {} as XMPPService
    
    // Mock usePubSub to return game state
    mockUsePubSub.mockReturnValue({
      document: mockGameState,
      updateDocument: jest.fn().mockResolvedValue({ success: true })
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Verify game state is loaded from PubSub
    expect(result.current.gameState).toEqual(mockGameState)
  })

  it('should update game state locally when nextTurn is called with null xmppClient', async () => {
    // Set up mocks for null xmppClient (offline mode)
    const xmppClient = null
    
    // Mock useIndexedDBData to return mock game state
    mockUseIndexedDBData.mockReturnValue({
      data: [mockRGameState],
      loading: false,
      error: null
    })
    
    // Mock localforage.setItem to resolve successfully
    mockLocalforageSetItem.mockResolvedValue(undefined)
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Call nextTurn
    await act(async () => {
      await result.current.nextTurn(mockGameProperties)
    })
    
    // Verify localforage.setItem was called with updated game state
    expect(mockLocalforageSetItem).toHaveBeenCalledWith(
      `${prefixKey}wargames`,
      expect.arrayContaining([expect.objectContaining({ 
        turn: '2', // Turn should be incremented
        currentPhase: 'planning' // Phase should be reset to first phase
      })])
    )
    
    // Verify game state was updated
    expect(result.current.gameState).toEqual(expect.objectContaining({
      turn: '2',
      currentPhase: 'planning'
    }))
  })

  it('should update game state via PubSub when nextTurn is called with xmppClient', async () => {
    // Set up mocks for available xmppClient
    const xmppClient = {} as XMPPService
    
    // Mock updateDocument function
    const mockUpdateDocument = jest.fn().mockResolvedValue({ success: true })
    
    // Mock usePubSub to return game state and updateDocument function
    mockUsePubSub.mockReturnValue({
      document: mockGameState,
      updateDocument: mockUpdateDocument
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Call nextTurn
    await act(async () => {
      await result.current.nextTurn(mockGameProperties)
    })
    
    // Verify updateDocument was called with updated game state
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        turn: '2', // Turn should be incremented
        currentPhase: 'planning' // Phase should be reset to first phase
      })
    )
    
    // Verify game state was updated
    expect(result.current.gameState).toEqual(expect.objectContaining({
      turn: '2',
      currentPhase: 'planning'
    }))
  })

  it('should not update game state when nextTurn is called with undefined xmppClient', async () => {
    // Set up mocks for undefined xmppClient (waiting for login)
    const xmppClient = undefined
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Call nextTurn
    await act(async () => {
      await result.current.nextTurn(mockGameProperties)
    })
    
    // Verify game state remains null
    expect(result.current.gameState).toBeNull()
    
    // Verify neither updateDocument nor localforage.setItem were called
    expect(mockLocalforageSetItem).not.toHaveBeenCalled()
  })

  it('should handle phase transition correctly when nextTurn is called', async () => {
    // Set up mocks for null xmppClient (offline mode)
    const xmppClient = null
    
    // Create RGameState with last phase
    const lastPhaseRGameState = {
      ...mockRGameState,
      currentPhase: 'assessment'
    }
    
    // Mock useIndexedDBData to return game state in last phase
    mockUseIndexedDBData.mockReturnValue({
      data: [lastPhaseRGameState],
      loading: false,
      error: null
    })
    
    // Mock localforage.setItem to resolve successfully
    mockLocalforageSetItem.mockResolvedValue(undefined)
    
    // Render the hook
    const { result } = renderHook(() => useGameState(xmppClient))
    
    // Verify initial state is in the last phase
    expect(result.current.gameState?.currentPhase).toBe('assessment')
    
    // Call nextTurn
    await act(async () => {
      await result.current.nextTurn(mockGameProperties)
    })
    
    // Verify game state was updated to the next turn and first phase
    expect(result.current.gameState).toEqual(expect.objectContaining({
      turn: '2', // Turn should be incremented
      currentPhase: 'planning' // Phase should be reset to first phase
    }))
  })
})
