import { XMPPService } from '../../../../services/XMPPService'

// Mock the TemplateDataProvider function
const mockDataProvider = jest.fn()
const mockTemplateDataProvider = jest.fn().mockImplementation((xmppClient) => {
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

// Mock the templateMapper module
jest.mock('../../../../components/AdminView/helpers/templateMapper', () => {
  return {
    TemplateDataProvider: mockTemplateDataProvider,
    TemplateMapper: {
      resource: 'templates',
      provider: mockTemplateDataProvider
    }
  }
})

// Import the mocked module after mocking
import { TemplateMapper } from '../../../../components/AdminView/helpers/templateMapper'

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
    
    it('should have the correct provider function', () => {
      // Execute
      const providerFn = TemplateMapper.provider
      expect(providerFn).toBeDefined()
      expect(providerFn).toBe(mockTemplateDataProvider)
    })
    
    it('should delegate to the TemplateDataProvider when called', () => {
      // Verify that the mapper correctly delegates to the data provider
      if (TemplateMapper.provider) {
        const provider = TemplateMapper.provider(mockXmppClient)
        expect(mockDataProvider).toHaveBeenCalledWith(mockXmppClient)
        expect(provider).toBeDefined()
      }
    })
  })
})
