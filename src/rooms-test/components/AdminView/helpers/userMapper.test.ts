import { userXtoR, userRtoX, userCreate, UserMapper } from '../../../../components/AdminView/helpers/userMapper'
import { USERS_PREFIX, USERS_COLLECTION } from '../../../../types/constants'
import { UserConfigType } from '../../../../types/wargame-d'
import { RUser, XUser } from '../../../../components/AdminView/raTypes-d'
import { XMPPService } from '../../../../services/XMPPService'

// Mock the trimHost function
jest.mock('../../../../components/AdminView/helpers/types', () => ({
  trimHost: (jid: string) => jid.split('@')[0],
  formatMemberWithHost: (member: string) => 
    member.includes('@') ? member : `${member}@ubuntu-linux-2404`,
  ResourceHandler: jest.fn()
}))

// Create mock functions
const mockCheckPubSubNodeExists = jest.fn()
const mockGetPubSubDocument = jest.fn()
const mockPublishPubSubLeaf = jest.fn()
const mockUpdateUserForceId = jest.fn()

// Create a mock XMPPService object with just the methods we need for testing
// Using 'as any' to bypass TypeScript's strict type checking for tests
const mockXmppClient = {
  bareJid: 'test-user@example.com',
  checkPubSubNodeExists: mockCheckPubSubNodeExists,
  getPubSubDocument: mockGetPubSubDocument,
  publishPubSubLeaf: mockPublishPubSubLeaf,
  updateUserForceId: mockUpdateUserForceId
} as Partial<XMPPService> as XMPPService

// Mock the XMPPService module
jest.mock('../../../../services/XMPPService', () => {
  return {
    XMPPService: jest.fn().mockImplementation(() => mockXmppClient)
  }
})

describe('userMapper', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('userXtoR', () => {
    it('should convert XUser to RUser with pubsub document', async () => {
      // Mock data
      const xUser: XUser = {
        username: 'test-user',
        name: 'Test User'
      }
      
      const userConfig: UserConfigType = {
        type: 'user-config-type-v1',
        name: 'Test User from PubSub'
      }
      
      // Setup mock
      mockGetPubSubDocument.mockResolvedValueOnce(userConfig)
      
      // Execute
      const result = await userXtoR(xUser, 'test-user', mockXmppClient)
      
      // Assert
      expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(result).toEqual({
        id: 'test-user',
        name: 'Test User from PubSub'
      })
    })
    
    it('should convert XUser to RUser without pubsub document', async () => {
      // Mock data
      const xUser: XUser = {
        username: 'test-user',
        name: 'Test User'
      }
      
      // Setup mock to return null (no pubsub doc)
      mockGetPubSubDocument.mockResolvedValueOnce(null)
      
      // Execute
      const result = await userXtoR(xUser, 'test-user', mockXmppClient)
      
      // Assert
      expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(result).toEqual({
        id: 'test-user',
        name: 'Test User'
      })
    })
    
    it('should strip host from id if present', async () => {
      // Mock data
      const xUser: XUser = {
        username: 'test-user@example.com',
        name: 'Test User'
      }
      
      // Setup mock
      mockGetPubSubDocument.mockResolvedValueOnce(null)
      
      // Execute
      const result = await userXtoR(xUser, 'test-user@example.com', mockXmppClient)
      
      // Assert
      expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(result).toEqual({
        id: 'test-user@example.com',
        name: 'Test User'
      })
    })
  })
  
  describe('userRtoX', () => {
    it('should create a new node if it does not exist', async () => {
      // Mock data
      const rUser: RUser = {
        id: 'test-user',
        name: 'Test User'
      }
      
      // Setup mocks
      mockCheckPubSubNodeExists.mockResolvedValueOnce(false)
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: true })
      
      // Execute
      const result = await userRtoX(rUser, 'test-user', mockXmppClient)
      
      // Assert
      expect(mockCheckPubSubNodeExists).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(mockPublishPubSubLeaf).toHaveBeenCalledWith(
        USERS_PREFIX + 'test-user',
        USERS_COLLECTION,
        {
          type: 'user-config-type-v1',
          name: 'Test User'
        }
      )
      expect(result).toEqual({
        username: 'test-user',
        name: 'Test User'
      })
    })
    
    it('should update an existing node if it exists', async () => {
      // Mock data
      const rUser: RUser = {
        id: 'test-user',
        name: 'Updated Test User'
      }
      
      const existingUserConfig: UserConfigType = {
        type: 'user-config-type-v1',
        name: 'Test User',
        forceId: 'force-1'
      }
      
      // Setup mocks
      mockCheckPubSubNodeExists.mockResolvedValueOnce(true)
      mockGetPubSubDocument.mockResolvedValueOnce(existingUserConfig)
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: true })
      
      // Execute
      const result = await userRtoX(rUser, 'test-user', mockXmppClient)
      
      // Assert
      expect(mockCheckPubSubNodeExists).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(mockGetPubSubDocument).toHaveBeenCalledWith(USERS_PREFIX + 'test-user')
      expect(mockPublishPubSubLeaf).toHaveBeenCalledWith(
        USERS_PREFIX + 'test-user',
        USERS_COLLECTION,
        {
          type: 'user-config-type-v1',
          name: 'Updated Test User',
          forceId: 'force-1'
        }
      )
      expect(result).toEqual({
        username: 'test-user',
        name: 'Updated Test User'
      })
    })
    
    it('should handle error when publishing document fails', async () => {
      // Mock data
      const rUser: RUser = {
        id: 'test-user',
        name: 'Test User'
      }
      
      const existingUserConfig: UserConfigType = {
        type: 'user-config-type-v1',
        name: 'Test User'
      }
      
      // Setup mocks
      mockCheckPubSubNodeExists.mockResolvedValueOnce(true)
      mockGetPubSubDocument.mockResolvedValueOnce(existingUserConfig)
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: false })
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Execute
      const result = await userRtoX(rUser, 'test-user', mockXmppClient)
      
      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('problem publishing document', 'test-user')
      expect(result).toEqual({
        username: 'test-user',
        name: 'Test User'
      })
      
      // Restore console.error
      consoleErrorSpy.mockRestore()
    })
  })
  
  describe('userCreate', () => {
    it('should add default values to a new user', () => {
      // Mock data
      const xUser: XUser = {
        username: 'test-user',
        name: 'Test User'
      }
      
      // Execute
      const result = userCreate(xUser)
      
      // Assert
      expect(result).toEqual({
        username: 'test-user',
        name: 'Test User',
        email: 'pending@example.com',
        password: 'pwd'
      })
    })
  })
  
  describe('UserMapper', () => {
    it('should have the correct resource name', () => {
      expect(UserMapper.resource).toBe('users')
    })
    
    it('should have the correct functions assigned', () => {
      expect(UserMapper.toRRecord).toBe(userXtoR)
      expect(UserMapper.toXRecord).toBe(userRtoX)
      expect(UserMapper.forCreate).toBe(userCreate)
    })
    
    it('should correctly modify IDs', () => {
      const modifyId = UserMapper.modifyId
      expect(modifyId).toBeDefined()
      
      if (modifyId) {
        expect(modifyId('test-user@example.com')).toBe('test-user')
        expect(modifyId('test-user')).toBe('test-user')
      }
    })
  })
})
