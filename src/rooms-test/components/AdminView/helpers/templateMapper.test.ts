import { TemplateMapper } from '../../../../components/AdminView/helpers/templateMapper'
import { XMPPService } from '../../../../services/XMPPService'

// Mock the TemplateDataProvider module
const mockDataProvider = jest.fn()

jest.mock('../../../../components/AdminView/Resources/templateDataProvider', () => {
  return {
    TemplateDataProvider: jest.fn().mockImplementation((xmppClient) => {
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
import { TemplateDataProvider } from '../../../../components/AdminView/Resources/templateDataProvider'

// Create a mock XMPPService
const mockXmppClient = {} as XMPPService

describe('templateMapper', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })
  
  describe('TemplateMapper', () => {
    it('should have the correct resource name', () => {
      expect(TemplateMapper.resource).toBe('templates')
    })
    
    it('should create a data provider when provider function is called', () => {
      // Execute
      const providerFn = TemplateMapper.provider
      expect(providerFn).toBeDefined()
      
      if (providerFn) {
        const provider = providerFn(mockXmppClient)
        
        // Assert
        expect(TemplateDataProvider).toHaveBeenCalledWith(mockXmppClient)
        expect(provider).toBeDefined()
      }
    })
    
    it('should delegate to the TemplateDataProvider', () => {
      // Verify that the mapper correctly delegates to the data provider
      if (TemplateMapper.provider) {
        TemplateMapper.provider(mockXmppClient)
        expect(mockDataProvider).toHaveBeenCalledWith(mockXmppClient)
      }
    })
  })
})
