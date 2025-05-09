import { roomXtoR, roomRtoX, RoomMapper } from '../../../../components/AdminView/helpers/roomMapper'
import { RRoom, XRoom } from '../../../../components/AdminView/raTypes-d'
import { ChatRoomConfig } from '../../../../types/rooms-d'

// Mock the helper functions
jest.mock('../../../../components/AdminView/helpers/types', () => {
  return {
    trimHost: (jid: string) => jid ? jid.split('@')[0] : jid,
    formatMemberWithHost: (member: string) => 
      member.includes('@') ? member : `${member}@ubuntu-linux-2404`,
    isJson: jest.fn(),
    ResourceHandler: jest.fn()
  }
})

// Import the types module and mock it
import * as typesModule from '../../../../components/AdminView/helpers/types'
const mockIsJson = typesModule.isJson as jest.Mock

describe('roomMapper', () => {
  describe('roomXtoR', () => {
    it('should convert XRoom to RRoom with basic properties', () => {
      // Mock data
      const xRoom: XRoom = {
        roomName: 'test-room',
        naturalName: 'Test Room',
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404'],
        owners: ['admin1@ubuntu-linux-2404'],
        admins: ['admin1@ubuntu-linux-2404', 'admin2@ubuntu-linux-2404']
      }
      
      // Execute
      const result = roomXtoR(xRoom)
      
      // Assert
      expect(result).toEqual({
        id: 'test-room',
        name: 'Test Room',
        details: undefined,
        members: ['user1', 'user2'],
        memberForces: undefined,
        owners: ['admin1'],
        admins: ['admin1', 'admin2']
      })
    })
    
    it('should use "pending" as name if naturalName is not provided', () => {
      // Mock data
      const xRoom: XRoom = {
        roomName: 'test-room'
      }
      
      // Execute
      const result = roomXtoR(xRoom)
      
      // Assert
      expect(result.name).toBe('pending')
    })
    
    it('should parse JSON description into details', () => {
      // Mock data
      const roomDetails = { type: 'game-room', capacity: 10 }
      const xRoom: XRoom = {
        roomName: 'test-room',
        naturalName: 'Test Room',
        description: JSON.stringify(roomDetails)
      }
      
      // Mock isJson to return true for this test
      mockIsJson.mockReturnValueOnce(true)
      
      // Execute
      const result = roomXtoR(xRoom)
      
      // Assert
      expect(result.details).toEqual(roomDetails)
    })
    
    it('should handle empty arrays', () => {
      // Mock data
      const xRoom: XRoom = {
        roomName: 'test-room',
        naturalName: 'Test Room'
      }
      
      // Execute
      const result = roomXtoR(xRoom)
      
      // Assert
      expect(result.members).toEqual([])
      expect(result.owners).toEqual([])
      expect(result.admins).toEqual([])
    })
  })
  
  describe('roomRtoX', () => {
    it('should convert RRoom to XRoom with basic properties', () => {
      // Mock data
      const rRoom: RRoom = {
        id: 'test-room',
        name: 'Test Room',
        members: ['user1', 'user2'],
        memberForces: ['force1', 'force2'],
        owners: ['admin1'],
        admins: ['admin1', 'admin2']
      }
      
      // Execute
      const result = roomRtoX(rRoom)
      
      // Assert
      expect(result).toEqual({
        roomName: 'test-room',
        naturalName: 'Test Room',
        description: undefined,
        members: ['user1@ubuntu-linux-2404', 'user2@ubuntu-linux-2404'],
        memberGroups: ['force1', 'force2'],
        persistent: true,
        publicRoom: undefined
      })
    })
    
    it('should stringify non-JSON details into description', () => {
      // Mock data
      const chatConfig: ChatRoomConfig = {
        roomType: 'chat'
      }
      
      const rRoom: RRoom = {
        id: 'test-room',
        name: 'Test Room',
        details: {
          description: 'Game room for testing',
          specifics: chatConfig
        }
      }
      
      // Mock isJson to return false for this test
      mockIsJson.mockReturnValueOnce(false)
      
      // Execute
      const result = roomRtoX(rRoom)
      
      // Assert
      expect(result.description).toBe(JSON.stringify(rRoom.details))
    })
    
    it('should handle empty arrays', () => {
      // Mock data
      const rRoom: RRoom = {
        id: 'test-room',
        name: 'Test Room'
      }
      
      // Execute
      const result = roomRtoX(rRoom)
      
      // Assert
      expect(result.members).toEqual([])
      expect(result.memberGroups).toBeUndefined()
    })
    
    it('should set persistent to true and include public flag', () => {
      // Mock data
      const rRoom: RRoom = {
        id: 'test-room',
        name: 'Test Room',
        public: true
      }
      
      // Execute
      const result = roomRtoX(rRoom)
      
      // Assert
      expect(result.persistent).toBe(true)
      expect(result.publicRoom).toBe(true)
    })
  })
  
  describe('RoomMapper', () => {
    it('should have the correct resource name', () => {
      expect(RoomMapper.resource).toBe('chatrooms')
    })
    
    it('should have the correct functions assigned', () => {
      expect(RoomMapper.toRRecord).toBe(roomXtoR)
      expect(RoomMapper.toXRecord).toBe(roomRtoX)
    })
  })
})
