import { groupXtoR, groupRtoX, groupCreate, GroupMapper } from '../../../../components/AdminView/helpers/groupMapper'
import { FORCES_PREFIX, FORCES_COLLECTION } from '../../../../types/constants'
import { ForceConfigType } from '../../../../types/wargame-d'
import { RGroup, XGroup } from '../../../../components/AdminView/raTypes-d'
import { XMPPService } from '../../../../services/XMPPService'

// Mock the helper functions
jest.mock('../../../../components/AdminView/helpers/types', () => ({
  trimHost: (jid: string) => jid.split('@')[0],
  formatMemberWithHost: (member: string) => 
    member.includes('@') ? member : `${member}@ubuntu-linux-2404`,
  ResourceHandler: jest.fn()
}))

// Create mock functions
const mockGetPubSubDocument = jest.fn()
const mockPublishPubSubLeaf = jest.fn()
const mockUpdateUserForceId = jest.fn()

// Create a mock XMPPService object with just the methods we need for testing
const mockXmppClient = {
  bareJid: 'test-user@example.com',
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

describe('groupMapper', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('groupXtoR', () => {
    it('should convert XGroup to RGroup without pubsub document when verbose is false', async () => {
      // Mock data
      const xGroup: XGroup = {
        name: 'test-force',
        members: ['user1', 'user2@ubuntu-linux-2404']
      }
      
      // Execute
      const result = await groupXtoR(xGroup, 'test-force', mockXmppClient, false)
      
      // Assert
      expect(mockGetPubSubDocument).not.toHaveBeenCalled()
      expect(result).toEqual({
        id: 'test-force',
        name: 'test-force',
        objectives: undefined,
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404'],
        color: undefined
      })
    })
    
    it('should convert XGroup to RGroup with pubsub document when verbose is true', async () => {
      // Mock data
      const xGroup: XGroup = {
        name: 'test-force',
        members: ['user1', 'user2@ubuntu-linux-2404']
      }
      
      const forceConfig: ForceConfigType = {
        type: 'force-config-type-v1',
        id: 'test-force',
        name: 'Test Force from PubSub',
        color: '#FF0000',
        objectives: 'Test objectives'
      }
      
      // Setup mock
      mockGetPubSubDocument.mockResolvedValueOnce(forceConfig)
      
      // Execute
      const result = await groupXtoR(xGroup, 'test-force', mockXmppClient, true)
      
      // Assert
      expect(mockGetPubSubDocument).toHaveBeenCalledWith(FORCES_PREFIX + 'test-force')
      expect(result).toEqual({
        id: 'test-force',
        name: 'Test Force from PubSub',
        objectives: 'Test objectives',
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404'],
        color: '#FF0000'
      })
    })
    
    it('should handle empty members array', async () => {
      // Mock data
      const xGroup: XGroup = {
        name: 'test-force'
      }
      
      // Execute
      const result = await groupXtoR(xGroup, 'test-force', mockXmppClient, false)
      
      // Assert
      expect(result.members).toEqual([])
    })
  })
  
  describe('groupRtoX', () => {
    it('should convert RGroup to XGroup and publish document', async () => {
      // Mock data
      const rGroup: RGroup = {
        id: 'test-force',
        name: 'Test Force',
        color: '#00FF00',
        objectives: 'Updated objectives',
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404']
      }
      
      // Setup mocks
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: true })
      
      // Execute
      const result = await groupRtoX(rGroup, 'test-force', mockXmppClient)
      
      // Assert
      expect(mockPublishPubSubLeaf).toHaveBeenCalledWith(
        FORCES_PREFIX + 'test-force',
        FORCES_COLLECTION,
        {
          type: 'force-config-type-v1',
          id: 'test-force',
          name: 'Test Force',
          color: '#00FF00',
          objectives: 'Updated objectives'
        }
      )
      expect(result).toEqual({
        name: 'test-force',
        description: undefined,
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404']
      })
    })
    
    it('should handle error when publishing document fails', async () => {
      // Mock data
      const rGroup: RGroup = {
        id: 'test-force',
        name: 'Test Force',
        members: ['user1@ubuntu-linux-2404']
      }
      
      // Setup mocks
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: false })
      
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Execute
      const result = await groupRtoX(rGroup, 'test-force', mockXmppClient)
      
      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('problem publishing document', 'test-force')
      expect(result).toEqual({
        name: 'test-force',
        description: undefined,
        members: ['user1@ubuntu-linux-2404']
      })
      
      // Restore console.error
      consoleErrorSpy.mockRestore()
    })
    
    it('should update user force IDs when members change', async () => {
      // Mock data
      const rGroup: RGroup = {
        id: 'test-force',
        name: 'Test Force',
        members: ['user1@ubuntu-linux-2404', 'user3@ubuntu-linux-2404']
      }
      
      const previousData: RGroup = {
        id: 'test-force',
        name: 'Test Force',
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404']
      }
      
      // Setup mocks
      mockPublishPubSubLeaf.mockResolvedValueOnce({ success: true })
      mockUpdateUserForceId.mockResolvedValue(undefined)
      
      // Execute
      await groupRtoX(rGroup, 'test-force', mockXmppClient, previousData)
      
      // Assert
      // Should remove user2 from the force
      expect(mockUpdateUserForceId).toHaveBeenCalledWith('user2', undefined)
      // Should add user3 to the force
      expect(mockUpdateUserForceId).toHaveBeenCalledWith('user3', 'test-force')
    })
  })
  
  describe('groupCreate', () => {
    it('should add default values to a new group', () => {
      // Mock data
      const xGroup: XGroup = {
        name: 'test-force'
      }
      
      // Execute
      const result = groupCreate(xGroup)
      
      // Assert
      expect(result).toEqual({
        name: 'test-force',
        members: [],
        admins: [],
        shared: false
      })
    })
  })
  
  describe('GroupMapper', () => {
    it('should have the correct resource name', () => {
      expect(GroupMapper.resource).toBe('groups')
    })
    
    it('should have the correct functions assigned', () => {
      expect(GroupMapper.toRRecord).toBe(groupXtoR)
      expect(GroupMapper.toXRecord).toBe(groupRtoX)
      expect(GroupMapper.forCreate).toBe(groupCreate)
    })
  })
})
