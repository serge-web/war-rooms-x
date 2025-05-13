import { XMPPService } from '../../../../services/XMPPService'
import { TEMPLATES_COLLECTION, TEMPLATES_PREFIX } from '../../../../types/constants'
import { Template } from '../../../../types/rooms-d'

// Create mock functions for XMPPService
const mockGetDiscoItems = jest.fn()
const mockGetPubSubDocument = jest.fn()
const mockPublishJsonToPubSubNode = jest.fn()
const mockPublishPubSubLeaf = jest.fn()
const mockDeletePubSubDocument = jest.fn()

// Create a mock XMPPService object
const mockXmppClient = {
  bareJid: 'test-user@example.com',
  pubsubServiceUrl: 'pubsub.example.com',
  client: {
    getDiscoItems: mockGetDiscoItems
  },
  getPubSubDocument: mockGetPubSubDocument,
  publishJsonToPubSubNode: mockPublishJsonToPubSubNode,
  publishPubSubLeaf: mockPublishPubSubLeaf,
  deletePubSubDocument: mockDeletePubSubDocument
} as unknown as XMPPService

// Mock the helper functions
jest.mock('../../../../components/AdminView/helpers/types', () => ({
  trimHost: (jid: string) => jid ? jid.split('@')[0] : jid,
  formatMemberWithHost: (member: string) => 
    member.includes('@') ? member : `${member}@ubuntu-linux-2404`,
  isJson: jest.fn().mockReturnValue(false),
  ResourceHandler: jest.fn()
}))

// Import the module to test
jest.unmock('../../../../components/AdminView/helpers/templateMapper')
import { TemplateMapper, TemplateDataProvider } from '../../../../components/AdminView/helpers/templateMapper'

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
      expect(providerFn).toBe(TemplateDataProvider)
    })
  })
  
  describe('TemplateDataProvider', () => {
    let provider: ReturnType<typeof TemplateDataProvider>
    
    beforeEach(() => {
      provider = TemplateDataProvider(mockXmppClient)
    })
    
    describe('getList', () => {
      it('should return empty array when no templates exist', async () => {
        // Setup mock
        mockGetDiscoItems.mockResolvedValueOnce(null)
        
        // Execute
        const result = await provider.getList('templates', {})
        
        // Assert
        expect(mockGetDiscoItems).toHaveBeenCalledWith('pubsub.example.com', TEMPLATES_COLLECTION)
        expect(result).toEqual({ data: [], total: 0 })
      })
      
      it('should fetch and return templates when they exist', async () => {
        // Setup mock
        const mockItems = [
          { node: 'template1' },
          { node: 'template2' }
        ]
        
        const mockTemplates = [
          { id: 'template1', schema: { title: 'Template 1' }, uiSchema: {} },
          { id: 'template2', schema: { title: 'Template 2' }, uiSchema: {} }
        ]
        
        mockGetDiscoItems.mockResolvedValueOnce({ items: mockItems })
        mockGetPubSubDocument.mockImplementation((id) => {
          if (id === 'template1') return Promise.resolve(mockTemplates[0])
          if (id === 'template2') return Promise.resolve(mockTemplates[1])
          return Promise.resolve(null)
        })
        
        // Execute
        const result = await provider.getList('templates', {})
        
        // Assert
        expect(mockGetDiscoItems).toHaveBeenCalledWith('pubsub.example.com', TEMPLATES_COLLECTION)
        expect(mockGetPubSubDocument).toHaveBeenCalledTimes(2)
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('template1')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith('template2')
        expect(result).toEqual({
          data: mockTemplates,
          total: 2
        })
      })
    })
    
    describe('getOne', () => {
      it('should fetch and return a single template', async () => {
        // Setup mock
        const mockTemplate = {
          id: 'template1',
          schema: { title: 'Template 1' },
          uiSchema: {}
        }
        
        mockGetPubSubDocument.mockResolvedValueOnce(mockTemplate)
        
        // Execute
        const result = await provider.getOne('templates', { id: 'template1' })
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template1')
        expect(result).toEqual({
          data: mockTemplate
        })
      })
      
      it('should return empty template when template not found', async () => {
        // Setup mock
        mockGetPubSubDocument.mockResolvedValueOnce(null)
        
        // Execute
        const result = await provider.getOne('templates', { id: 'nonexistent' })
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'nonexistent')
        expect(result.data).toEqual({
          id: 'pending',
          schema: expect.objectContaining({ 
            title: 'pending', 
            type: 'object', 
            properties: {} 
          }),
          uiSchema: {}
        })
      })
    })
    
    describe('getMany', () => {
      it('should fetch and return multiple templates', async () => {
        // Setup mock
        const mockTemplates = [
          { id: 'template1', schema: { title: 'Template 1' }, uiSchema: {} },
          { id: 'template2', schema: { title: 'Template 2' }, uiSchema: {} }
        ]
        
        mockGetPubSubDocument.mockImplementation((id) => {
          if (id === TEMPLATES_PREFIX + 'template1') return Promise.resolve(mockTemplates[0])
          if (id === TEMPLATES_PREFIX + 'template2') return Promise.resolve(mockTemplates[1])
          return Promise.resolve(null)
        })
        
        // Execute
        const result = await provider.getMany('templates', { ids: ['template1', 'template2'] })
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template1')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template2')
        expect(result).toEqual({
          data: mockTemplates
        })
      })
      
      it('should handle missing templates with empty template', async () => {
        // Setup mock
        mockGetPubSubDocument.mockResolvedValue(null)
        
        // Execute
        const result = await provider.getMany('templates', { ids: ['nonexistent1', 'nonexistent2'] })
        
        // Assert
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'nonexistent1')
        expect(mockGetPubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'nonexistent2')
        expect(result.data.length).toBe(2)
        expect(result.data[0].id).toBe('pending')
        expect(result.data[1].id).toBe('pending')
      })
    })
    
    describe('getManyReference', () => {
      it('should throw error as not supported', async () => {
        // Execute & Assert
        await expect(provider.getManyReference('templates', { 
          target: 'id', 
          id: 'template1',
          pagination: { page: 1, perPage: 10 },
          sort: { field: 'id', order: 'ASC' },
          filter: {}
        })).rejects.toThrow('getManyReference not supported for templates')
      })
    })
    
    describe('updateMany', () => {
      it('should throw error as not supported', async () => {
        // Execute & Assert
        await expect(provider.updateMany('templates', { 
          ids: ['template1', 'template2'],
          data: { schema: { title: 'Updated' } }
        })).rejects.toThrow('updateMany not supported for templates')
      })
    })
    
    describe('create', () => {
      it('should create a new template', async () => {
        // Setup mock
        const mockTemplate = {
          id: 'template1',
          schema: { title: 'Template 1' },
          uiSchema: {}
        }
        
        mockPublishPubSubLeaf.mockResolvedValueOnce({ success: true })
        
        // Execute
        const result = await provider.create('templates', { data: mockTemplate })
        
        // Assert
        expect(mockPublishPubSubLeaf).toHaveBeenCalledWith(
          TEMPLATES_PREFIX + 'template1',
          TEMPLATES_COLLECTION,
          mockTemplate
        )
        expect(result).toEqual({
          data: mockTemplate
        })
      })
      
      it('should throw error when template has no id', async () => {
        // Setup mock
        const mockTemplate = {
          schema: { title: 'Template 1' },
          uiSchema: {}
        } as Template
        
        // Execute & Assert
        await expect(provider.create('templates', { data: mockTemplate }))
          .rejects.toThrow('Template must have an id')
        
        expect(mockPublishPubSubLeaf).not.toHaveBeenCalled()
      })
      
      it('should throw error when publishing fails', async () => {
        // Setup mock
        const mockTemplate = {
          id: 'template1',
          schema: { title: 'Template 1' },
          uiSchema: {}
        }
        
        mockPublishPubSubLeaf.mockResolvedValueOnce({ success: false, error: 'Test error' })
        
        // Execute & Assert
        await expect(provider.create('templates', { data: mockTemplate }))
          .rejects.toThrow('Failed to create template.Test error')
      })
    })
    
    describe('update', () => {
      it('should update an existing template', async () => {
        // Setup mock
        const mockTemplate = {
          id: 'template1',
          schema: { title: 'Updated Template 1' },
          uiSchema: {}
        }
        
        mockPublishJsonToPubSubNode.mockResolvedValueOnce({ success: true })
        
        // Execute
        const result = await provider.update('templates', { 
          id: 'template1',
          data: mockTemplate,
          previousData: { id: 'template1', schema: { title: 'Template 1' }, uiSchema: {} }
        })
        
        // Assert
        expect(mockPublishJsonToPubSubNode).toHaveBeenCalledWith(
          TEMPLATES_PREFIX + 'template1',
          mockTemplate
        )
        expect(result).toEqual({
          data: mockTemplate
        })
      })
      
      it('should throw error when publishing fails', async () => {
        // Setup mock
        const mockTemplate = {
          id: 'template1',
          schema: { title: 'Updated Template 1' },
          uiSchema: {}
        }
        
        mockPublishJsonToPubSubNode.mockResolvedValueOnce({ success: false, error: 'Test error' })
        
        // Execute & Assert
        await expect(provider.update('templates', { 
          id: 'template1',
          data: mockTemplate,
          previousData: { id: 'template1', schema: { title: 'Template 1' }, uiSchema: {} }
        }))
          .rejects.toThrow('Failed to update template.Test error')
      })
    })
    
    describe('delete', () => {
      it('should delete a template', async () => {
        // Setup mock
        mockDeletePubSubDocument.mockResolvedValueOnce({ success: true })
        
        // Execute
        const result = await provider.delete('templates', { id: 'template1' })
        
        // Assert
        expect(mockDeletePubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template1')
        expect(result).toEqual({
          data: null
        })
      })
      
      it('should throw error when deletion fails', async () => {
        // Setup mock
        mockDeletePubSubDocument.mockResolvedValueOnce({ success: false, error: 'Test error' })
        
        // Execute & Assert
        await expect(provider.delete('templates', { id: 'template1' }))
          .rejects.toThrow('Failed to delete template.Test error')
      })
    })
    
    describe('deleteMany', () => {
      it('should delete multiple templates', async () => {
        // Setup mock
        mockDeletePubSubDocument.mockResolvedValue({ success: true })
        
        // Execute
        const result = await provider.deleteMany('templates', { ids: ['template1', 'template2'] })
        
        // Assert
        expect(mockDeletePubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template1')
        expect(mockDeletePubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template2')
        expect(result).toEqual({
          data: []
        })
      })
      
      it('should throw error when all deletions fail', async () => {
        // Setup mock
        mockDeletePubSubDocument.mockResolvedValue({ success: false, error: 'Test error' })
        
        // Execute & Assert
        await expect(provider.deleteMany('templates', { ids: ['template1', 'template2'] }))
          .rejects.toThrow('Failed to delete template:Test error, Test error')
      })
      
      it('should succeed if at least one deletion succeeds', async () => {
        // Setup mock
        mockDeletePubSubDocument.mockImplementation((id) => {
          if (id === TEMPLATES_PREFIX + 'template1') {
            return Promise.resolve({ success: true })
          }
          return Promise.resolve({ success: false, error: 'Test error' })
        })
        
        // Execute
        const result = await provider.deleteMany('templates', { ids: ['template1', 'template2'] })
        
        // Assert
        expect(mockDeletePubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template1')
        expect(mockDeletePubSubDocument).toHaveBeenCalledWith(TEMPLATES_PREFIX + 'template2')
        expect(result).toEqual({
          data: []
        })
      })
    })
  })
})
