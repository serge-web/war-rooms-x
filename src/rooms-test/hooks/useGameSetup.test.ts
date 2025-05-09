import { renderHook } from '@testing-library/react'
import { useGameProperties } from '../../components/PlayerView/GameState/useGameSetup'
import { GamePropertiesType } from '../../types/wargame-d'
import { XMPPService } from '../../services/XMPPService'
import { LINEAR_TURNS } from '../../types/constants'
import { ThemeConfig } from 'antd'

// Mock the usePubSub hook
jest.mock('../../hooks/usePubSub', () => ({
  usePubSub: jest.fn()
}))

// Mock the useIndexedDBData hook
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: jest.fn()
}))

// Import the mocked modules
import { usePubSub } from '../../hooks/usePubSub'
import { useIndexedDBData } from '../../hooks/useIndexedDBData'

// Cast the mocked functions to the correct types
const mockUsePubSub = usePubSub as jest.MockedFunction<typeof usePubSub>
const mockUseIndexedDBData = useIndexedDBData as jest.MockedFunction<typeof useIndexedDBData>

// Mock game properties data
const mockPlayerTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff'
  }
}

const mockAdminTheme: ThemeConfig = {
  token: {
    colorPrimary: '#ff4d4f',
    colorBgContainer: '#f0f0f0'
  }
}

const mockGameProperties: GamePropertiesType = {
  name: 'Test Game',
  description: 'This is a test game',
  startTime: '2023-01-01T00:00:00.000Z',
  interval: '1d',
  turnType: LINEAR_TURNS,
  playerTheme: mockPlayerTheme,
  adminTheme: mockAdminTheme
}

// Mock RGameState (combined state for RA data provider)
const mockRGameState = {
  id: 'game1',
  name: 'Test Game',
  description: 'This is a test game',
  turn: '1',
  currentPhase: 'planning',
  currentTime: '2023-01-01T00:00:00.000Z',
  startTime: '2023-01-01T00:00:00.000Z',
  interval: '1d',
  turnType: LINEAR_TURNS,
  playerTheme: mockPlayerTheme,
  adminTheme: mockAdminTheme
}

describe('useGameProperties hook', () => {
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

  it('should return null gameProperties when waiting for login', () => {
    // Set up mocks for undefined xmppClient (waiting for login)
    const xmppClient = undefined
    
    // Render the hook
    const { result } = renderHook(() => useGameProperties(xmppClient))
    
    // Verify initial state is null
    expect(result.current.gameProperties).toBeNull()
    expect(result.current.name).toBeUndefined()
    expect(result.current.description).toBeUndefined()
    expect(result.current.playerTheme).toBeUndefined()
    expect(result.current.adminTheme).toBeUndefined()
  })

  it('should load mock game properties when xmppClient is null', () => {
    // Set up mocks for null xmppClient (offline mode)
    const xmppClient = null
    
    // Mock useIndexedDBData to return mock game state
    mockUseIndexedDBData.mockReturnValue({
      data: [mockRGameState],
      loading: false,
      error: null
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameProperties(xmppClient))
    
    // Verify game properties are loaded from mock data
    expect(result.current.gameProperties).toEqual(mockGameProperties)
    expect(result.current.name).toBe('Test Game')
    expect(result.current.description).toBe('This is a test game')
    expect(result.current.playerTheme).toEqual(mockPlayerTheme)
    expect(result.current.adminTheme).toEqual(mockAdminTheme)
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
    const { result } = renderHook(() => useGameProperties(xmppClient))
    
    // Verify game properties are null during loading
    expect(result.current.gameProperties).toBeNull()
    expect(result.current.name).toBeUndefined()
    expect(result.current.description).toBeUndefined()
    expect(result.current.playerTheme).toBeUndefined()
    expect(result.current.adminTheme).toBeUndefined()
  })

  it('should load game properties from PubSub when xmppClient is available', () => {
    // Set up mocks for available xmppClient
    const xmppClient = {} as XMPPService
    
    // Mock usePubSub to return game properties
    mockUsePubSub.mockReturnValue({
      document: mockGameProperties,
      updateDocument: jest.fn().mockResolvedValue({ success: true })
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameProperties(xmppClient))
    
    // Verify game properties are loaded from PubSub
    expect(result.current.gameProperties).toEqual(mockGameProperties)
    expect(result.current.name).toBe('Test Game')
    expect(result.current.description).toBe('This is a test game')
    expect(result.current.playerTheme).toEqual(mockPlayerTheme)
    expect(result.current.adminTheme).toEqual(mockAdminTheme)
  })

  it('should handle missing theme properties correctly', () => {
    // Set up mocks for available xmppClient
    const xmppClient = {} as XMPPService
    
    // Create game properties without themes
    const propertiesWithoutThemes = {
      ...mockGameProperties,
      playerTheme: undefined,
      adminTheme: undefined
    }
    
    // Mock usePubSub to return game properties without themes
    mockUsePubSub.mockReturnValue({
      document: propertiesWithoutThemes,
      updateDocument: jest.fn().mockResolvedValue({ success: true })
    })
    
    // Render the hook
    const { result } = renderHook(() => useGameProperties(xmppClient))
    
    // Verify game properties are loaded but themes are undefined
    expect(result.current.gameProperties).toEqual(propertiesWithoutThemes)
    expect(result.current.name).toBe('Test Game')
    expect(result.current.description).toBe('This is a test game')
    expect(result.current.playerTheme).toBeUndefined()
    expect(result.current.adminTheme).toBeUndefined()
  })
})
