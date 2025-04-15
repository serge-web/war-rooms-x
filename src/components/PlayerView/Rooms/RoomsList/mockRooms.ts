import { MockRoom } from "../../../../types/rooms-d"

export const mockRooms: MockRoom[] = [
  {
    id: 'room1',
    name: 'Command Room',
    unreadCount: 3,
    messages: [
      { id: 'msg1', sender: 'Commander', content: 'Status report', timestamp: '10:00' },
      { id: 'msg2', sender: 'currentUser', content: 'All systems operational', timestamp: '10:01' },
      { id: 'msg3', sender: 'Commander', content: 'Excellent. Any issues to report?', timestamp: '10:03' },
      { id: 'msg4', sender: 'currentUser', content: 'Negative. All units ready for deployment.', timestamp: '10:05' },
      { id: 'msg5', sender: 'Intel Officer', content: 'New intelligence coming in from sector 7', timestamp: '10:08' },
      { id: 'msg6', sender: 'Commander', content: 'Brief us on the details', timestamp: '10:10' },
      { id: 'msg7', sender: 'Intel Officer', content: 'Enemy forces spotted moving north. Estimated strength: battalion', timestamp: '10:12' },
      { id: 'msg8', sender: 'currentUser', content: 'Recommending immediate air reconnaissance', timestamp: '10:15' },
      { id: 'msg9', sender: 'Commander', content: 'Approved. Launch recon drones.', timestamp: '10:17' },
      { id: 'msg10', sender: 'Logistics', content: 'Supply convoy ETA 30 minutes to forward base', timestamp: '10:20' },
      { id: 'msg11', sender: 'currentUser', content: 'Acknowledged. Prepare for rapid offload.', timestamp: '10:22' },
      { id: 'msg12', sender: 'Commander', content: 'Set defensive perimeter before nightfall', timestamp: '10:25' },
      { id: 'msg13', sender: 'currentUser', content: 'Already in progress. Estimated completion in 2 hours.', timestamp: '10:27' },
      { id: 'msg14', sender: 'Intel Officer', content: 'Drone footage confirms enemy positions. Sending coordinates.', timestamp: '10:30' },
      { id: 'msg15', sender: 'Artillery Officer', content: 'Artillery units standing by for coordinates', timestamp: '10:32' },
      { id: 'msg16', sender: 'Commander', content: 'Hold fire until my command', timestamp: '10:35' },
      { id: 'msg17', sender: 'Medical Officer', content: 'Field hospital established and operational', timestamp: '10:38' },
      { id: 'msg18', sender: 'currentUser', content: 'Excellent work. Casualty evacuation routes confirmed.', timestamp: '10:40' },
      { id: 'msg19', sender: 'Communications Officer', content: 'Secure comms established with HQ', timestamp: '10:42' },
      { id: 'msg20', sender: 'Commander', content: 'Prepare for mission briefing at 1100 hours', timestamp: '10:45' }
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
  },
  {
    id: '__admin',
    name: 'Admin',
    unreadCount: 2,
    messages: [
      { id: 'admin1', sender: 'System', content: 'Wargame initialization complete', timestamp: '08:00' },
      { id: 'admin2', sender: 'Admin', content: 'Setting up exercise parameters for Operation Swift Response', timestamp: '08:05' },
      { id: 'admin3', sender: 'System', content: 'Force templates loaded successfully', timestamp: '08:10' },
      { id: 'admin4', sender: 'Admin', content: 'Assigning roles to participants', timestamp: '08:15' },
      { id: 'admin5', sender: 'currentUser', content: 'Requesting additional user accounts for observers', timestamp: '08:20' },
      { id: 'admin6', sender: 'Admin', content: 'Observer accounts created. Credentials distributed via secure channel.', timestamp: '08:25' },
      { id: 'admin7', sender: 'System', content: 'Map data loaded: Eastern Europe Theater', timestamp: '08:30' },
      { id: 'admin8', sender: 'Admin', content: 'Scenario timeline adjusted to 72-hour exercise', timestamp: '08:35' },
      { id: 'admin9', sender: 'currentUser', content: 'Confirming weather conditions set to variable with 30% precipitation chance', timestamp: '08:40' },
      { id: 'admin10', sender: 'System', content: 'Weather parameters updated successfully', timestamp: '08:45' },
      { id: 'admin11', sender: 'Admin', content: 'Scheduling system maintenance for 02:00 tomorrow - 30 minute downtime expected', timestamp: '08:50' },
      { id: 'admin12', sender: 'System', content: 'Communication channels tested and operational', timestamp: '08:55' },
      { id: 'admin13', sender: 'Admin', content: 'Enabling advanced cyber warfare module for this exercise', timestamp: '09:00' },
      { id: 'admin14', sender: 'currentUser', content: 'Requesting permission to modify force composition for Blue Team', timestamp: '09:05' },
      { id: 'admin15', sender: 'Admin', content: 'Permission granted. Please document changes in the exercise log.', timestamp: '09:10' },
      { id: 'admin16', sender: 'System', content: 'Database backup completed successfully', timestamp: '09:15' },
      { id: 'admin17', sender: 'Admin', content: 'Setting up after-action review parameters and metrics', timestamp: '09:20' },
      { id: 'admin18', sender: 'currentUser', content: 'Metrics configuration confirmed. Adding custom evaluation criteria for logistics performance.', timestamp: '09:25' },
      { id: 'admin19', sender: 'System', content: 'Warning: Participant connection from unauthorized IP address detected', timestamp: '09:30' },
      { id: 'admin20', sender: 'Admin', content: 'Security alert acknowledged. Implementing additional verification for external connections.', timestamp: '09:35' }
    ]
  }
]
