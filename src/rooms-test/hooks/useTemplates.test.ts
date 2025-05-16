import { renderHook, waitFor } from '@testing-library/react'
import { useTemplates } from '../../hooks/useTemplates'
import { Template } from '../../types/rooms-d'
import { TEMPLATES_COLLECTION } from '../../types/constants'
import { WargameContextType } from '../../types/wargame-d'

// Mock the useWargame hook
jest.mock('../../contexts/WargameContext', () => ({
  useWargame: jest.fn()
}))

// Mock the useIndexedDBData hook
jest.mock('../../hooks/useIndexedDBData', () => ({
  useIndexedDBData: jest.fn()
}))

// Import the mocked modules
import { useWargame } from '../../contexts/WargameContext'
import { useIndexedDBData } from '../../hooks/useIndexedDBData'
import { XMPPService } from '../../services/XMPPService'

// Cast the mocked functions to the correct types
const mockUseWargame = useWargame as jest.MockedFunction<typeof useWargame>
const mockUseIndexedDBData = useIndexedDBData as jest.MockedFunction<typeof useIndexedDBData>

// Mock template data
const mockTemplateData: Template[] = [
  {
    id: 'template1',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        age: { type: 'number', title: 'Age' }
      },
      required: ['name']
    },
    uiSchema: {
      'ui:order': ['name', 'age']
    }
  },
  {
    id: 'template2',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', title: 'Title' },
        description: { type: 'string', title: 'Description' }
      },
      required: ['title']
    },
    uiSchema: {
      description: {
        'ui:widget': 'textarea'
      }
    }
  }
]

// Create a base mock for WargameContextType
const createWargameContextMock = (xmppClientValue: XMPPService | undefined | null): WargameContextType => ({
  loggedIn: xmppClientValue !== undefined,
  xmppClient: xmppClientValue,
  setXmppClient: jest.fn(),
  raDataProvider: undefined,
  setRaDataProvider: jest.fn(),
  mockPlayerId: null,
  setMockPlayerId: jest.fn(),
  playerDetails: null,
  getForce: jest.fn().mockResolvedValue({}),
  getPlayerDetails: jest.fn().mockResolvedValue({}),
  gameProperties: null,
  gameState: null,
  nextTurn: jest.fn().mockResolvedValue(undefined),
  rooms: []
})

describe('useTemplates hook', () => {
  // Mock getPubSubCollectionItems function
  const mockGetPubSubCollectionItems = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementation for useIndexedDBData
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: false,
      error: null
    })
  })

  it('should return empty array when waiting for login', () => {
    // Mock undefined xmppClient (waiting for login state)
    mockUseWargame.mockReturnValue(createWargameContextMock(undefined))
    
    // Render the hook
    const { result } = renderHook(() => useTemplates())
    
    // Verify initial state is empty array
    expect(result.current.templates).toEqual([])
  })

  it('should return mock templates when xmppClient is null', async () => {
    // Mock null xmppClient (offline mode)
    mockUseWargame.mockReturnValue(createWargameContextMock(null))
    
    // Mock useIndexedDBData to return mock templates
    mockUseIndexedDBData.mockReturnValue({
      data: mockTemplateData,
      loading: false,
      error: null
    })

    // Render the hook
    const { result } = renderHook(() => useTemplates())
    
    // Verify templates are set from mock data
    expect(result.current.templates).toEqual(mockTemplateData)
  })

  it('should handle loading state correctly', async () => {
    // Mock null xmppClient (offline mode)
    mockUseWargame.mockReturnValue(createWargameContextMock(null))
    
    // Mock useIndexedDBData to be in loading state
    mockUseIndexedDBData.mockReturnValue({
      data: null,
      loading: true,
      error: null
    })

    // Render the hook
    const { result } = renderHook(() => useTemplates())
    
    // Verify templates are empty during loading
    expect(result.current.templates).toEqual([])
  })

  it('should fetch templates from XMPP when xmppClient is available', async () => {
    // Create mock XMPP client
    const mockXmppClient = {
      getPubSubCollectionItems: mockGetPubSubCollectionItems
    }
    
    // Mock getPubSubCollectionItems to return template data
    mockGetPubSubCollectionItems.mockResolvedValue(mockTemplateData)
    
    // Mock xmppClient to be available
    mockUseWargame.mockReturnValue(createWargameContextMock(mockXmppClient as unknown as XMPPService))
    
    // Render the hook
    const { result } = renderHook(() => useTemplates())
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockGetPubSubCollectionItems).toHaveBeenCalledWith(TEMPLATES_COLLECTION)
    })
    
    // Verify templates are fetched from XMPP
    await waitFor(() => {
      expect(result.current.templates).toEqual(mockTemplateData)
    })
  })

  it('should handle empty mock templates', async () => {
    // Mock null xmppClient (offline mode)
    mockUseWargame.mockReturnValue(createWargameContextMock(null))
    
    // Mock useIndexedDBData to return empty array
    mockUseIndexedDBData.mockReturnValue({
      data: [],
      loading: false,
      error: null
    })

    // Render the hook
    const { result } = renderHook(() => useTemplates())
    
    // Verify templates are empty
    expect(result.current.templates).toEqual([])
  })
})
