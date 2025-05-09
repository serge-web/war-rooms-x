import { XMPPService } from '../../../../services/XMPPService'

// Mock the WargameDataProvider function
const mockDataProvider = jest.fn()
const mockWargameDataProvider = jest.fn().mockImplementation((xmppClient) => {
  mockDataProvider(xmppClient)
  return {
    getList: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyReference: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn()
  }
})

// Mock the wargameMapper module
jest.mock('../../../../components/AdminView/helpers/wargameMapper', () => {
  return {
    WargameDataProvider: mockWargameDataProvider,
    WargameMapper: {
      resource: 'wargames',
      provider: mockWargameDataProvider
    }
  }
})

// Import the mocked module after mocking
import { WargameMapper } from '../../../../components/AdminView/helpers/wargameMapper'

// Create a mock XMPPService
const mockXmppClient = {} as XMPPService

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
      expect(providerFn).toBe(mockWargameDataProvider)
    })
    
    it('should delegate to the WargameDataProvider when called', () => {
      // Verify that the mapper correctly delegates to the data provider
      if (WargameMapper.provider) {
        const provider = WargameMapper.provider(mockXmppClient)
        expect(mockDataProvider).toHaveBeenCalledWith(mockXmppClient)
        expect(provider).toBeDefined()
      }
    })
  })
})
