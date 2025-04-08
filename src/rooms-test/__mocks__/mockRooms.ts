export const mockRooms = [
  {
    id: 'room1',
    name: 'Command Room',
    unreadCount: 3,
    messages: [
      { id: 'msg1', sender: 'Commander', content: 'Status report', timestamp: '10:00' },
      { id: 'msg2', sender: 'currentUser', content: 'All systems operational', timestamp: '10:01' }
    ]
  },
  {
    id: 'room2',
    name: 'Intelligence',
    unreadCount: 0,
    messages: [
      { id: 'msg3', sender: 'Intel Officer', content: 'New intel available', timestamp: '09:45' },
      { id: 'msg4', sender: 'currentUser', content: 'Reviewing now', timestamp: '09:46' }
    ]
  },
  {
    id: 'room3',
    name: 'Operations',
    unreadCount: 5,
    messages: [
      { id: 'msg5', sender: 'Ops Manager', content: 'Mission briefing at 1100', timestamp: '09:30' }
    ]
  }
]
