import { XMPPService } from '../../../../services/XMPPService'
import { RGameState } from '../../../../components/AdminView/raTypes-d'
import { GameStateType, GamePropertiesType } from '../../../../types/wargame-d'

// Create mock functions for XMPPService
const mockGetPubSubDocument = jest.fn()
const mockPublishPubSubLeaf = jest.fn()

// Create a mock XMPPService object
const mockXmppClient = {
  bareJid: 'test-user@example.com',
  pubsubService: 'pubsub.example.com',
  getPubSubDocument: mockGetPubSubDocument,
  publishPubSubLeaf: mockPublishPubSubLeaf
} as unknown as XMPPService

// Mock the split-game-state helper functions
jest.mock('../../../../helpers/split-game-state', () => ({
  mergeGameState: jest.fn((setup, state) => ({
    ...setup,
    ...state,
    id: '1', // Required for RGameState
  })),
  splitGameState: jest.fn((game) => ({
    gameProperties: {
      name: game.name,
      description: game.description,
      startTime: game.startTime,
      interval: game.interval,
      turnType: game.turnType,
      playerTheme: game.playerTheme,
      adminTheme: game.adminTheme
    },
    gameState: {
      turn: game.turn,
      currentTime: game.currentTime,
      currentPhase: game.currentPhase
    }
  }))
}))

// Import the module to test
jest.unmock('../../../../components/AdminView/helpers/wargameMapper')
import { WargameMapper, WargameDataProvider } from '../../../../components/AdminView/helpers/wargameMapper'
import { mergeGameState, splitGameState } from '../../../../helpers/split-game-state'

describe('wargameMapper', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })
  
  describe('WargameMapper', () => {
    it('should have the correct resource name', () => {
      expect(WargameMapper.resource).toBe('wargames')
    })
    
    it('should have the correct provider function', () => {
      // Execute
      const providerFn = WargameMapper.provider
      expect(providerFn).toBeDefined()
      expect(providerFn).toBe(WargameDataProvider)
    })
  })
  
  describe('WargameDataProvider', () => {
    let provider: ReturnType<typeof WargameDataProvider>
    
    beforeEach(() => {
      provider = WargameDataProvider(mockXmppClient)
    })
    
    describe('getList', () => {
      it('should fetch and merge game state and setup', async () => {
        // Setup mock data
        const mockGameState: GameStateType = {
          turn: '2',
          currentTime: '2025-05-09T10:00:00Z',
          currentPhase: 'Planning'
        }
        
        const mockGameSetup: GamePropertiesType = {
          name: 'Test Wargame',
          description: 'Test description',
          startTime: '2025-05-09T09:00:00Z',
          interval: '1',
          turnType: 'Linear',
          playerTheme: undefined,
          adminTheme: undefined
        }
        
        // Mock the getPubSubDocument calls
        mockGetPubSubDocument.mockImplementation((docId) => {
          if (docId === 'game-state') return Promise.resolve(mockGameState)
          if (docId === 'game-setup') return Promise.resolve(mockGameSetup)
          return Promise.resolve(null)
        })
        
        // Execute
        const result = await provider.getList('wargames', {})
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-state')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-setup')
        expect(mergeGameState).toHaveBeenCalledWith(mockGameSetup, mockGameState)
        expect(result.data.length).toBe(1)
        expect(result.total).toBe(1)
      })
      
      it('should use default values when documents do not exist', async () => {
        // Mock the getPubSubDocument calls to return null
        mockGetPubSubDocument.mockResolvedValue(null)
        
        // Execute
        const result = await provider.getList('wargames', {})
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-state')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-setup')
        expect(mergeGameState).toHaveBeenCalled()
        expect(result.data.length).toBe(1)
        expect(result.total).toBe(1)
      })
    })
    
    describe('getOne', () => {
      it('should fetch and merge game state and setup', async () => {
        // Setup mock data
        const mockGameState: GameStateType = {
          turn: '2',
          currentTime: '2025-05-09T10:00:00Z',
          currentPhase: 'Planning'
        }
        
        const mockGameSetup: GamePropertiesType = {
          name: 'Test Wargame',
          description: 'Test description',
          startTime: '2025-05-09T09:00:00Z',
          interval: '1',
          turnType: 'Linear',
          playerTheme: undefined,
          adminTheme: undefined
        }
        
        // Mock the getPubSubDocument calls
        mockGetPubSubDocument.mockImplementation((docId) => {
          if (docId === 'game-state') return Promise.resolve(mockGameState)
          if (docId === 'game-setup') return Promise.resolve(mockGameSetup)
          return Promise.resolve(null)
        })
        
        // Execute
        const result = await provider.getOne('wargames', { id: '1' })
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-state')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('game-setup')
        expect(mergeGameState).toHaveBeenCalledWith(mockGameSetup, mockGameState)
        expect(result.data).toBeDefined()
      })
    })
    
    describe('update', () => {
      it('should split and publish game state and setup', async () => {
        // Setup mock data
        const mockGame: RGameState = {
          id: '1',
          name: 'Updated Wargame',
          description: 'Updated description',
          startTime: '2025-05-09T09:00:00Z',
          interval: '1',
          turnType: 'Linear',
          turn: '3',
          currentTime: '2025-05-09T11:00:00Z',
          currentPhase: 'Execution'
        }
        
        // Mock the publishPubSubLeaf to return success
        mockPublishPubSubLeaf.mockResolvedValue({ success: true })
        
        // Execute
        const result = await provider.update('wargames', { 
          id: '1',
          data: mockGame,
          previousData: { id: '1' } as RGameState
        })
        
        // Assert
        expect(splitGameState).toHaveBeenCalledWith(mockGame)
        expect(mockPublishPubSubLeaf).toHaveBeenCalledTimes(2)
        expect(mockPublishPubSubLeaf).toHaveBeenCalledWith('game-setup', undefined, expect.anything())
        expect(mockPublishPubSubLeaf).toHaveBeenCalledWith('game-state', undefined, expect.anything())
        expect(result.data).toEqual(mockGame)
      })
    })
    
    describe('create', () => {
      it('should split and publish game state and setup', async () => {
        // Setup mock data
        const mockGame: RGameState = {
          id: '1',
          name: 'New Wargame',
          description: 'New description',
          startTime: '2025-05-09T09:00:00Z',
          interval: '1',
          turnType: 'Linear',
          turn: '1',
          currentTime: '2025-05-09T09:00:00Z',
          currentPhase: 'Planning'
        }
        
        // Mock the publishPubSubLeaf to return success
        mockPublishPubSubLeaf.mockResolvedValue({ success: true })
        
        // Execute
        const result = await provider.create('wargames', { data: mockGame })
        
        // Assert
        expect(splitGameState).toHaveBeenCalledWith(mockGame)
        expect(mockPublishPubSubLeaf).toHaveBeenCalledTimes(2)
        expect(mockPublishPubSubLeaf).toHaveBeenCalledWith('game-setup', undefined, expect.anything())
        expect(mockPublishPubSubLeaf).toHaveBeenCalledWith('game-state', undefined, expect.anything())
        expect(result.data).toEqual(mockGame)
      })
    })
    
    describe('getMany and getManyReference', () => {
      it('should return empty arrays', async () => {
        // Execute
        const manyResult = await provider.getMany('wargames', { ids: ['1'] })
        const manyRefResult = await provider.getManyReference('wargames', { 
          target: 'id', 
          id: '1',
          pagination: { page: 1, perPage: 10 },
          sort: { field: 'id', order: 'ASC' },
          filter: {}
        })
        
        // Assert
        expect(manyResult.data).toEqual([])
        expect(manyRefResult.data).toEqual([])
      })
    })
    
    describe('delete and deleteMany', () => {
      it('should return null and empty array respectively', async () => {
        // Execute
        const deleteResult = await provider.delete('wargames', { id: '1' })
        const deleteManyResult = await provider.deleteMany('wargames', { ids: ['1'] })
        
        // Assert
        expect(deleteResult.data).toBeNull()
        expect(deleteManyResult.data).toEqual([])
      })
    })
  })
})
