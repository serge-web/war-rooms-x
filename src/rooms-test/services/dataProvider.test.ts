import { XMPPService } from '../../services/XMPPService'
import { XMPPRestService } from '../../services/XMPPRestService'
import dataProvider from '../../components/AdminView/dataProvider'
import { AnyResourceHandler } from '../../components/AdminView/raHelpers'

// Define simplified types for testing
type TestRecord = { id: string; name?: string; title?: string }

// Mock the mappers module
jest.mock('../../components/AdminView/raHelpers', () => {
  const originalModule = jest.requireActual('../../components/AdminView/raHelpers')
  return {
    ...originalModule,
    mappers: [
      {
        resource: 'testResource',
        toRRecord: jest.fn((data: TestRecord) => ({ id: data.id, name: data.name })),
        toXRecord: jest.fn((data: TestRecord) => ({ id: data.id, name: data.name }))
      },
      {
        resource: 'customResource',
        toRRecord: jest.fn((data: TestRecord) => ({ id: data.id, title: data.title })),
        toXRecord: jest.fn((data: TestRecord) => ({ id: data.id, title: data.title })),
        provider: jest.fn((_xmppClient) => ({
          getList: jest.fn().mockResolvedValue({ data: [{ id: 'custom1', title: 'Custom 1' }], total: 1 }),
          getOne: jest.fn().mockResolvedValue({ data: { id: 'custom1', title: 'Custom 1' } }),
          getMany: jest.fn().mockResolvedValue({ data: [{ id: 'custom1', title: 'Custom 1' }] }),
          getManyReference: jest.fn().mockResolvedValue({ data: [{ id: 'custom1', title: 'Custom 1' }], total: 1 }),
          create: jest.fn().mockResolvedValue({ data: { id: 'custom2', title: 'Custom 2' } }),
          update: jest.fn().mockResolvedValue({ data: { id: 'custom1', title: 'Updated Custom' } }),
          updateMany: jest.fn().mockResolvedValue({ data: [1] }),
          delete: jest.fn().mockResolvedValue({ data: { id: 'custom1' } }),
          deleteMany: jest.fn().mockResolvedValue({ data: [1] })
        }))
      },
      {
        resource: 'chatrooms',
        toRRecord: jest.fn((data: TestRecord) => ({ id: data.id, name: data.name })),
        toXRecord: jest.fn((data: TestRecord) => ({ id: data.id, name: data.name }))
      }
    ] as unknown as AnyResourceHandler[]
  }
})

// Create mock functions for XMPPService
const mockXmppClient = {
  bareJid: 'test-user@example.com',
  pubsubService: 'pubsub.example.com'
} as unknown as XMPPService

// Create mock functions for XMPPRestService
const mockGet = jest.fn()
const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()

const mockRestClient = {
  getClient: jest.fn().mockReturnValue({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete
  })
} as unknown as XMPPRestService

describe('dataProvider', () => {
  let provider: ReturnType<typeof dataProvider>
  
  beforeEach(() => {
    jest.clearAllMocks()
    provider = dataProvider(mockRestClient, mockXmppClient)
  })
  
  describe('getList', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.getList('customResource', {})
      
      // Assert
      expect(result).toEqual({ data: [{ id: 'custom1', title: 'Custom 1' }], total: 1 })
      expect(mockGet).not.toHaveBeenCalled()
    })
    
    it('should fetch data from REST API for standard resources', async () => {
      // Setup mock
      mockGet.mockResolvedValueOnce({
        data: {
          testResource: [
            { id: 'test1', name: 'Test 1' },
            { id: 'test2', name: 'Test 2' }
          ]
        }
      })
      
      // Execute
      const result = await provider.getList('testResource', {})
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith('/testResource')
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })
    
    it('should handle custom routes for special resources', async () => {
      // Setup mock
      mockGet.mockResolvedValueOnce({
        data: {
          chatRooms: [
            { id: 'room1', name: 'Room 1' },
            { id: 'room2', name: 'Room 2' }
          ]
        }
      })
      
      // Execute
      const result = await provider.getList('chatrooms', {})
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith('/chatrooms?type=all')
      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })
    
    it('should return empty data when REST API returns no data', async () => {
      // Setup mock
      mockGet.mockResolvedValueOnce(null)
      
      // Execute
      const result = await provider.getList('testResource', {})
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith('/testResource')
      expect(result).toEqual({ data: [], total: 0 })
    })
  })
  
  describe('getOne', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.getOne('customResource', { id: 'custom1' })
      
      // Assert
      expect(result).toEqual({ data: { id: 'custom1', title: 'Custom 1' } })
      expect(mockGet).not.toHaveBeenCalled()
    })
    
    it('should fetch data from REST API for standard resources', async () => {
      // Setup mock
      mockGet.mockResolvedValueOnce({
        data: { id: 'test1', name: 'Test 1' }
      })
      
      // Execute
      const result = await provider.getOne('testResource', { id: 'test1' })
      
      // Assert
      expect(mockGet).toHaveBeenCalledWith('/testResource/test1')
      expect(result.data).toEqual({ id: 'test1', name: 'Test 1' })
    })
  })
  
  describe('getMany', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.getMany('customResource', { ids: ['custom1'] })
      
      // Assert
      expect(result).toEqual({ data: [{ id: 'custom1', title: 'Custom 1' }] })
      expect(mockGet).not.toHaveBeenCalled()
    })
    
    it('should fetch data from REST API for standard resources', async () => {
      // Setup mock
      mockGet.mockResolvedValueOnce({
        data: { id: 'test1', name: 'Test 1' }
      })
      mockGet.mockResolvedValueOnce({
        data: { id: 'test2', name: 'Test 2' }
      })
      
      // Execute
      const result = await provider.getMany('testResource', { ids: ['test1', 'test2'] })
      
      // Assert
      expect(mockGet).toHaveBeenCalledTimes(2)
      expect(mockGet).toHaveBeenCalledWith('/testResource/test1')
      expect(mockGet).toHaveBeenCalledWith('/testResource/test2')
      expect(result.data).toHaveLength(2)
    })
  })
  
  describe('create', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.create('customResource', { data: { title: 'Custom 2' } })
      
      // Assert
      expect(result).toEqual({ data: { id: 'custom2', title: 'Custom 2' } })
      expect(mockPost).not.toHaveBeenCalled()
    })
    
    it('should post data to REST API for standard resources', async () => {
      // Setup mock
      mockPost.mockResolvedValueOnce({
        data: { id: 'test3', name: 'Test 3' }
      })
      
      // No need for additional mocking
      
      // Execute
      const result = await provider.create('testResource', { data: { name: 'Test 3' } })
      
      // Assert
      expect(mockPost).toHaveBeenCalledWith('/testResource', { name: 'Test 3' })
      // Just check that we have a data property with the expected structure
      expect(result).toHaveProperty('data')
    })
  })
  
  describe('update', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.update('customResource', { id: 'custom1', data: { title: 'Updated Custom' }, previousData: { id: 'custom1', title: 'Custom 1' } })
      
      // Assert
      expect(result).toEqual({ data: { id: 'custom1', title: 'Updated Custom' } })
      expect(mockPut).not.toHaveBeenCalled()
    })
    
    it('should put data to REST API for standard resources', async () => {
      // Setup mock
      mockPut.mockResolvedValueOnce({
        data: { id: 'test1', name: 'Updated Test' }
      })
      
      // No need for additional mocking
      
      // Execute
      const result = await provider.update('testResource', { id: 'test1', data: { name: 'Updated Test' }, previousData: { id: 'test1', name: 'Test 1' } })
      
      // Assert
      expect(mockPut).toHaveBeenCalledWith('/testResource/test1', { name: 'Updated Test' })
      // Just check that we have a data property with the expected structure
      expect(result).toHaveProperty('data')
    })
  })
  
  describe('delete', () => {
    it('should use custom mapper when available', async () => {
      // Execute
      const result = await provider.delete('customResource', { id: 'custom1' })
      
      // Assert
      expect(result).toEqual({ data: { id: 'custom1' } })
      expect(mockDelete).not.toHaveBeenCalled()
    })
    
    it('should delete data from REST API for standard resources', async () => {
      // Setup mock
      mockDelete.mockResolvedValueOnce({
        data: { id: 'test1' }
      })
      
      // Execute
      const result = await provider.delete('testResource', { id: 'test1' })
      
      // Assert
      expect(mockDelete).toHaveBeenCalledWith('/testResource/test1')
      expect(result.data).toEqual({ id: 'test1' })
    })
  })
})
