import { MockRoom, ChatMessage } from "../../../../types/rooms-d"

export const mockRooms: MockRoom[] = [
  {
    id: 'room1',
    name: 'Command Room',
    unreadCount: 3,
    messages: [
      { 
        id: 'msg1', 
        details: {
          messageType: 'chat',
          senderId: 'commander-1',
          senderName: 'Commander',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T10:00:00Z',
          channel: 'room1'
        },
        content: { value: 'Status report' } as ChatMessage
      },
      { 
        id: 'msg2', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T10:01:00Z',
          channel: 'room1'
        },
        content: { value: 'All systems operational' } as ChatMessage
      },
      { 
        id: 'msg3', 
        details: {
          messageType: 'chat',
          senderId: 'commander-1',
          senderName: 'Commander',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T10:03:00Z',
          channel: 'room1'
        },
        content: { value: 'Excellent. Any issues to report?' } as ChatMessage
      },
      { 
        id: 'msg4', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T10:05:00Z',
          channel: 'room1'
        },
        content: { value: 'Negative. All units ready for deployment.' } as ChatMessage
      },
      { 
        id: 'msg5', 
        details: {
          messageType: 'chat',
          senderId: 'intel-1',
          senderName: 'Intel Officer',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T10:08:00Z',
          channel: 'room1'
        },
        content: { value: 'New intelligence coming in from sector 7' } as ChatMessage
      }
    ]
  },
  {
    id: 'room2',
    name: 'Intelligence',
    unreadCount: 0,
    messages: [
      { 
        id: 'msg3', 
        details: {
          messageType: 'chat',
          senderId: 'intel-1',
          senderName: 'Intel Officer',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T09:45:00Z',
          channel: 'room2'
        },
        content: { value: 'New intel available' } as ChatMessage
      },
      { 
        id: 'msg4', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T09:46:00Z',
          channel: 'room2'
        },
        content: { value: 'Reviewing now' } as ChatMessage
      }
    ]
  },
  {
    id: 'room3',
    name: 'Operations',
    unreadCount: 5,
    messages: [
      { 
        id: 'msg5', 
        details: {
          messageType: 'chat',
          senderId: 'ops-1',
          senderName: 'Ops Manager',
          senderForce: 'Blue Force',
          turn: '1',
          phase: 'Planning',
          timestamp: '2025-04-16T09:30:00Z',
          channel: 'room3'
        },
        content: { value: 'Mission briefing at 1100' } as ChatMessage
      }
    ]
  },
  {
    id: '__admin',
    name: 'Admin',
    unreadCount: 2,
    messages: [
      { 
        id: 'admin1', 
        details: {
          messageType: 'chat',
          senderId: 'system',
          senderName: 'System',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:00:00Z',
          channel: '__admin'
        },
        content: { value: 'Wargame initialization complete' } as ChatMessage
      },
      { 
        id: 'admin2', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:05:00Z',
          channel: '__admin'
        },
        content: { value: 'Setting up exercise parameters for Operation Swift Response' } as ChatMessage
      },
      { 
        id: 'admin3', 
        details: {
          messageType: 'chat',
          senderId: 'system',
          senderName: 'System',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:10:00Z',
          channel: '__admin'
        },
        content: { value: 'Force templates loaded successfully' } as ChatMessage
      },
      { 
        id: 'admin4', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:15:00Z',
          channel: '__admin'
        },
        content: { value: 'Assigning roles to participants' } as ChatMessage
      },
      { 
        id: 'admin5', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:20:00Z',
          channel: '__admin'
        },
        content: { value: 'Requesting additional user accounts for observers' } as ChatMessage
      },
      { 
        id: 'admin6', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:25:00Z',
          channel: '__admin'
        },
        content: { value: 'Observer accounts created. Credentials distributed via secure channel.' } as ChatMessage
      },
      { 
        id: 'admin7', 
        details: {
          messageType: 'chat',
          senderId: 'system',
          senderName: 'System',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:30:00Z',
          channel: '__admin'
        },
        content: { value: 'Map data loaded: Eastern Europe Theater' } as ChatMessage
      },
      { 
        id: 'admin8', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:35:00Z',
          channel: '__admin'
        },
        content: { value: 'Scenario timeline adjusted to 72-hour exercise' } as ChatMessage
      },
      { 
        id: 'admin9', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:40:00Z',
          channel: '__admin'
        },
        content: { value: 'Confirming weather conditions set to variable with 30% precipitation chance' } as ChatMessage
      },
      { 
        id: 'admin10', 
        details: {
          messageType: 'chat',
          senderId: 'system',
          senderName: 'System',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:45:00Z',
          channel: '__admin'
        },
        content: { value: 'Weather parameters updated successfully' } as ChatMessage
      },
      { 
        id: 'admin11', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:50:00Z',
          channel: '__admin'
        },
        content: { value: 'Scheduling system maintenance for 02:00 tomorrow - 30 minute downtime expected' } as ChatMessage
      },
      { 
        id: 'admin12', 
        details: {
          messageType: 'chat',
          senderId: 'system',
          senderName: 'System',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T08:55:00Z',
          channel: '__admin'
        },
        content: { value: 'Communication channels tested and operational' } as ChatMessage
      },
      { 
        id: 'admin13', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T09:00:00Z',
          channel: '__admin'
        },
        content: { value: 'Enabling advanced cyber warfare module for this exercise' } as ChatMessage
      },
      { 
        id: 'admin14', 
        details: {
          messageType: 'chat',
          senderId: 'current-user',
          senderName: 'currentUser',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T09:05:00Z',
          channel: '__admin'
        },
        content: { value: 'Requesting permission to modify force composition for Blue Team' } as ChatMessage
      },
      { 
        id: 'admin15', 
        details: {
          messageType: 'chat',
          senderId: 'admin-user',
          senderName: 'Admin',
          senderForce: 'Admin',
          turn: '0',
          phase: 'Setup',
          timestamp: '2025-04-16T09:10:00Z',
          channel: '__admin'
        },
        content: { value: 'Permission granted. Please document changes in the exercise log.' } as ChatMessage
      }
    ]
  }
]
