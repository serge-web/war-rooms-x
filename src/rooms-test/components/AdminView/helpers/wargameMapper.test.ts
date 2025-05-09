import { WargameMapper } from '../../../../components/AdminView/helpers/wargameMapper'
import { XMPPService } from '../../../../services/XMPPService'

// Mock the WargameDataProvider module
const mockDataProvider = jest.fn()

jest.mock('../../../../components/AdminView/Resources/wargameDataProvider', () => {
  return {
    WargameDataProvider: jest.fn().mockImplementation((xmppClient) => {
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
  }
})

// Import the mocked module after mocking
import { WargameDataProvider } from '../../../../components/AdminView/Resources/wargameDataProvider'

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
    
    it('should create a data provider when provider function is called', () => {
      // Execute
      const providerFn = WargameMapper.provider
      expect(providerFn).toBeDefined()
      
      if (providerFn) {
        const provider = providerFn(mockXmppClient)
        
        // Assert
        expect(WargameDataProvider).toHaveBeenCalledWith(mockXmppClient)
        expect(provider).toBeDefined()
      }
    })
    
    it('should delegate to the WargameDataProvider', () => {
      // Verify that the mapper correctly delegates to the data provider
      if (WargameMapper.provider) {
        WargameMapper.provider(mockXmppClient)
        expect(mockDataProvider).toHaveBeenCalledWith(mockXmppClient)
      }
    })
  })
})
