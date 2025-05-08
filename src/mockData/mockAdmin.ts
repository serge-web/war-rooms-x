import { RGameState, RGroup, RRoom, RUser } from "../components/AdminView/raTypes-d"
import { ChatMessage, GameMessage, MessageDetails, Template } from "../types/rooms-d"

interface MockBackend {
  wargames: RGameState[],
  users: RUser[],
  groups: RGroup[],
  chatrooms: RRoom[]
  templates: Template[]
}

const admin: RUser = {id: 'admin', name: 'Game Control', email: 'admin'}
const blueCo: RUser = {id: 'blue-co', name: 'Blue CO', email: 'blue-co'}
const redCo: RUser = {id: 'red-co', name: 'Red CO', email: 'red-co'}
const greenCo: RUser = {id: 'green-co', name: 'Green CO', email: 'green-co'}
const blueLogs: RUser = {id: 'blue-logs', name: 'Blue Logs', email: 'blue-logs'}
const redLogs: RUser = {id: 'red-logs', name: 'Red Logs', email: 'red-logs'}
const greenLogs: RUser = {id: 'green-logs', name: 'Green Logs', email: 'green-logs'}
const blueForce: RGroup = {id: 'blue', name: 'Blue', description: 'Own forces', members: [blueCo.id, blueLogs.id], color: '#00F '}  
const redForce: RGroup = {id: 'red', name: 'Red', description: 'Opponent forces', members: [redCo.id, redLogs.id], color: '#F00'}
const greenForce: RGroup = {id: 'green', name: 'Green', description: 'Friendly forces', members: [greenCo.id, greenLogs.id], color: '#0F0'}
const umpires: RGroup = {id: 'umpire', name: 'Umpire', description: 'Umpire Force (adjudicators)', members: [admin.id], color: '#CCC'}
const wargame: RGameState ={
  id: '1',
  name: 'Catch that pigeon!',
  startTime: "2025-04-25T00:00:00.000Z",
  interval: 'PT1H30M',
  turnType: 'Linear',
  turn: '1',
  currentTime: "2025-04-25T12:00:00.000Z",
  currentPhase: 'Planning',
  theme: {}
}
// Helper function to create a message
const createMessage = (id: string, senderId: string, senderName: string, senderForce: string, content: string, timestamp: string, channel: string): GameMessage => {
  const details: MessageDetails = {
    messageType: 'chat',
    senderId,
    senderName,
    senderForce,
    turn: wargame.turn,
    phase: wargame.currentPhase,
    timestamp,
    channel
  }
  
  return {
    id,
    details,
    content: { value: content } as ChatMessage
  }
}

// Create timestamps for messages (most recent first)
const now = new Date()
const timestamps = Array.from({ length: 10 }, (_, i) => {
  const date = new Date(now)
  date.setMinutes(now.getMinutes() - (i * 15)) // 15 minute intervals
  return date.toISOString()
}).reverse()

// Blue chat messages
const blueMessages: GameMessage[] = [
  createMessage('blue-msg-1', blueCo.id, blueCo.name, blueForce.id, 'Team, let\'s review our current position and plan our next move.', timestamps[0], 'blue-chat'),
  createMessage('blue-msg-2', blueLogs.id, blueLogs.name, blueForce.id, 'Supply status: Ammunition at 85%, fuel at 70%, medical supplies at 90%.', timestamps[1], 'blue-chat'),
  createMessage('blue-msg-3', blueCo.id, blueCo.name, blueForce.id, 'Good. What\'s our ETA for the next resupply?', timestamps[2], 'blue-chat'),
  createMessage('blue-msg-4', blueLogs.id, blueLogs.name, blueForce.id, 'Resupply scheduled in 6 hours if weather holds.', timestamps[3], 'blue-chat'),
  createMessage('blue-msg-5', blueCo.id, blueCo.name, blueForce.id, 'We need to secure the eastern flank before then. Let\'s move Alpha team into position.', timestamps[4], 'blue-chat'),
  createMessage('blue-msg-6', blueCo.id, blueCo.name, blueForce.id, 'Any intel on enemy movements in sector 4?', timestamps[5], 'blue-chat'),
  createMessage('blue-msg-7', blueLogs.id, blueLogs.name, blueForce.id, 'Negative. Reconnaissance drones will be operational in 30 minutes.', timestamps[6], 'blue-chat')
]

// Blue C2 messages
const blueC2Messages: GameMessage[] = [
  createMessage('blue-c2-msg-1', blueCo.id, blueCo.name, blueForce.id, 'Command, we need authorization for artillery support in grid reference 45-89.', timestamps[0], 'blue-c2'),
  createMessage('blue-c2-msg-2', blueCo.id, blueCo.name, blueForce.id, 'Enemy forces spotted moving toward our southern position.', timestamps[2], 'blue-c2'),
  createMessage('blue-c2-msg-3', blueCo.id, blueCo.name, blueForce.id, 'Requesting air support for defensive operation.', timestamps[3], 'blue-c2'),
  createMessage('blue-c2-msg-4', blueLogs.id, blueLogs.name, blueForce.id, 'Air support ETA 15 minutes. Prepare targeting coordinates.', timestamps[4], 'blue-c2'),
  createMessage('blue-c2-msg-5', blueCo.id, blueCo.name, blueForce.id, 'Roger that. Coordinates being transmitted on secure channel.', timestamps[5], 'blue-c2'),
  createMessage('blue-c2-msg-6', blueLogs.id, blueLogs.name, blueForce.id, 'Be advised, weather conditions may affect air support effectiveness.', timestamps[7], 'blue-c2')
]

// Red chat messages
const redMessages: GameMessage[] = [
  createMessage('red-msg-1', redCo.id, redCo.name, redForce.id, 'Our reconnaissance indicates Blue Force is preparing for an offensive.', timestamps[0], 'red-chat'),
  createMessage('red-msg-2', redLogs.id, redLogs.name, redForce.id, 'Current supply levels: Ammunition at 65%, fuel at 80%, medical at 75%.', timestamps[1], 'red-chat'),
  createMessage('red-msg-3', redCo.id, redCo.name, redForce.id, 'We need to reinforce our defensive positions immediately.', timestamps[2], 'red-chat'),
  createMessage('red-msg-4', redLogs.id, redLogs.name, redForce.id, 'Moving additional units to the western perimeter.', timestamps[3], 'red-chat'),
  createMessage('red-msg-5', redCo.id, redCo.name, redForce.id, 'Prepare counter-offensive strategies. We\'ll discuss in the next briefing.', timestamps[4], 'red-chat'),
  createMessage('red-msg-6', redLogs.id, redLogs.name, redForce.id, 'Electronic warfare systems are online and operational.', timestamps[6], 'red-chat'),
  createMessage('red-msg-7', redCo.id, redCo.name, redForce.id, 'Good. Monitor Blue Force communications and report any actionable intelligence.', timestamps[8], 'red-chat')
]

// Red C2 messages
const redC2Messages: GameMessage[] = [
  createMessage('red-c2-msg-1', redCo.id, redCo.name, redForce.id, 'Command, requesting permission to deploy special operations team to sector 7.', timestamps[1], 'red-c2'),
  createMessage('red-c2-msg-2', redCo.id, redCo.name, redForce.id, 'Intelligence suggests high-value target in the area.', timestamps[2], 'red-c2'),
  createMessage('red-c2-msg-3', redLogs.id, redLogs.name, redForce.id, 'Permission granted. Extraction plan is being finalized.', timestamps[3], 'red-c2'),
  createMessage('red-c2-msg-4', redCo.id, redCo.name, redForce.id, 'Team Alpha is ready for deployment. ETA to target: 45 minutes.', timestamps[5], 'red-c2'),
  createMessage('red-c2-msg-5', redLogs.id, redLogs.name, redForce.id, 'Be advised, satellite imagery shows increased enemy activity in adjacent sectors.', timestamps[7], 'red-c2'),
  createMessage('red-c2-msg-6', redCo.id, redCo.name, redForce.id, 'Understood. We\'ll adjust our approach accordingly.', timestamps[9], 'red-c2')
]

// Green chat messages
const greenMessages: GameMessage[] = [
  createMessage('green-msg-1', greenCo.id, greenCo.name, greenForce.id, 'Maintaining neutrality in the current conflict is our priority.', timestamps[0], 'green-chat'),
  createMessage('green-msg-2', greenLogs.id, greenLogs.name, greenForce.id, 'Humanitarian aid distribution is proceeding as planned.', timestamps[1], 'green-chat'),
  createMessage('green-msg-3', greenCo.id, greenCo.name, greenForce.id, 'We need additional security for the aid convoys.', timestamps[3], 'green-chat'),
  createMessage('green-msg-4', greenLogs.id, greenLogs.name, greenForce.id, 'Requesting escort from peacekeeping forces for tomorrow\'s convoy.', timestamps[4], 'green-chat'),
  createMessage('green-msg-5', greenCo.id, greenCo.name, greenForce.id, 'Approved. Coordinate with local authorities for route security.', timestamps[5], 'green-chat'),
  createMessage('green-msg-6', greenLogs.id, greenLogs.name, greenForce.id, 'Medical supplies are running low. Prioritizing distribution to critical areas.', timestamps[7], 'green-chat'),
  createMessage('green-msg-7', greenCo.id, greenCo.name, greenForce.id, 'Acknowledged. Let\'s request an emergency resupply from headquarters.', timestamps[9], 'green-chat')
]

// Umpire chat messages
const umpireMessages: GameMessage[] = [
  createMessage('umpire-msg-1', admin.id, admin.name, umpires.id, 'All forces, be advised: weather conditions will deteriorate in the next 6 hours.', timestamps[0], 'umpire-chat'),
  createMessage('umpire-msg-2', admin.id, admin.name, umpires.id, 'Blue Force artillery strike in sector 3 has been adjudicated. Results will be communicated separately.', timestamps[2], 'umpire-chat'),
  createMessage('umpire-msg-3', admin.id, admin.name, umpires.id, 'Red Force special operations mission outcome: partial success. Details forthcoming.', timestamps[4], 'umpire-chat'),
  createMessage('umpire-msg-4', admin.id, admin.name, umpires.id, 'Reminder: next turn submissions due in 2 hours.', timestamps[5], 'umpire-chat'),
  createMessage('umpire-msg-5', admin.id, admin.name, umpires.id, 'Green Force humanitarian mission has been approved and will proceed as planned.', timestamps[6], 'umpire-chat'),
  createMessage('umpire-msg-6', admin.id, admin.name, umpires.id, 'All forces: scenario update will be provided at the next briefing.', timestamps[8], 'umpire-chat')
]

// Logistics chat messages
const logsMessages: GameMessage[] = [
  createMessage('logs-msg-1', blueLogs.id, blueLogs.name, blueForce.id, 'All logistics officers, please provide your current supply status.', timestamps[0], 'logs-chat'),
  createMessage('logs-msg-2', redLogs.id, redLogs.name, redForce.id, 'Red Force: Ammunition at 65%, fuel at 80%, medical at 75%.', timestamps[1], 'logs-chat'),
  createMessage('logs-msg-3', blueLogs.id, blueLogs.name, blueForce.id, 'Blue Force: Ammunition at 85%, fuel at 70%, medical at 90%.', timestamps[2], 'logs-chat'),
  createMessage('logs-msg-4', greenLogs.id, greenLogs.name, greenForce.id, 'Green Force: Medical supplies at 50%, food at 65%, shelter materials at 40%.', timestamps[3], 'logs-chat'),
  createMessage('logs-msg-5', redLogs.id, redLogs.name, redForce.id, 'Weather forecast indicates potential supply route disruptions. Recommend stockpiling critical supplies.', timestamps[5], 'logs-chat'),
  createMessage('logs-msg-6', blueLogs.id, blueLogs.name, blueForce.id, 'Agreed. We should coordinate our resupply missions to maximize efficiency.', timestamps[6], 'logs-chat'),
  createMessage('logs-msg-7', greenLogs.id, greenLogs.name, greenForce.id, 'Green Force priority is medical supplies. Can either of you spare any?', timestamps[7], 'logs-chat'),
  createMessage('logs-msg-8', blueLogs.id, blueLogs.name, blueForce.id, 'We can provide some medical supplies. Will coordinate transfer details offline.', timestamps[8], 'logs-chat')
]

// Admin messages
const adminMessages: GameMessage[] = [
  createMessage('admin-msg-1', admin.id, admin.name, umpires.id, 'System maintenance scheduled for tonight at 02:00. Expect 30 minutes downtime.', timestamps[0], '__admin'),
  createMessage('admin-msg-2', admin.id, admin.name, umpires.id, 'New scenario parameters have been uploaded to the system.', timestamps[2], '__admin'),
  createMessage('admin-msg-3', admin.id, admin.name, umpires.id, 'Reminder: All participants must submit their action plans before the deadline.', timestamps[4], '__admin'),
  createMessage('admin-msg-4', admin.id, admin.name, umpires.id, 'Technical issue with the mapping system has been resolved.', timestamps[6], '__admin'),
  createMessage('admin-msg-5', admin.id, admin.name, umpires.id, 'Next game session will begin tomorrow at 09:00. All participants must be logged in by 08:45.', timestamps[8], '__admin')
]

const mapMessages: GameMessage[] = [{
  id: 'map-msg-1',
  details: {
    messageType: 'map',
    senderId: admin.id,
    senderName: admin.name,
    senderForce: umpires.id,
    turn: '1',
    phase: 'Planning',
    timestamp: timestamps[0],
    channel: 'main-map'
  },
  content: {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-0.09, 51.505]
      },
      id: 'test-point',
      properties: {
        name: 'Test Point'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[-0.29, 51.605], [-0.3, 51.805], [-0.4, 51.905], [-0.5, 52.005]]
      },
      properties: {
        name: 'Test Line'
      },
      id: 'test-line'
    }
  ]
  }
}]

const chatrooms: RRoom[] = [
  {id: 'blue-orders', name: 'Blue Orders', details:{description: 'Blue Orders', specifics: {roomType: 'form', templateIds: ['sitrep', 'demo-numbers']}}, memberForces:[blueForce.id], dummyMessages: blueC2Messages},
  {id: 'blue-chat', name: 'blue chat', details:{description: 'Blue Force discussions', specifics: {roomType: 'chat'}}, memberForces:[blueForce.id], dummyMessages: blueMessages},
  {id: 'blue-c2', name: 'blue c2', details:{description: 'Blue command and control discussions', specifics: {roomType: 'chat'}}, memberForces:[blueForce.id], dummyMessages: blueC2Messages},
  {id: 'red-chat', name: 'red chat', details:{description: 'Red force discussions', specifics: {roomType: 'chat'}}, memberForces:[redForce.id], dummyMessages: redMessages},
  {id: 'red-c2', name: 'red c2', details:{description: 'Red command and control discussions', specifics: {roomType: 'chat'}}, memberForces:[redForce.id], dummyMessages: redC2Messages},
  {id: 'green-chat', name: 'green chat', details:{description: 'Green force discussions', specifics: {roomType: 'chat'}}, memberForces:[greenForce.id], dummyMessages: greenMessages},
  {id: 'umpire-chat', name: 'umpire chat', details:{description: 'Umpire force discussions, about game-play and rules', specifics: {roomType: 'chat'}}, memberForces:[umpires.id], dummyMessages: umpireMessages},
  {id: 'main-map', name: 'Main Map', details:{description: 'Main map', specifics: {roomType: 'map', backdropUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}}, public: false, members: ['blue-logs'], dummyMessages: mapMessages},
  {id: 'logs-chat', name: 'Logistics Debate', details:{description: 'Logistics Debate, across forces, discussing logistic issues', specifics: {roomType: 'form', templateIds: ['sitrep', 'chat']}}, members: [blueLogs.id, redLogs.id, greenLogs.id], memberForces:[umpires.id], dummyMessages: logsMessages},
  {id: '__admin', name: 'Admin', details:{description: 'Game administration', specifics: {roomType: 'chat'}}, public: true, dummyMessages: adminMessages}
]

const templates: Template[] = [
  {
    id: 'chat',
    schema: {
      type: 'object',
      title: 'Chat',
      properties: {
        message: {
          type: 'string',
          title: 'Message'
        }
      }
    },
    uiSchema: {
      message: {
        'ui:widget': 'textarea'
      }
    }
  },
  {
    id: 'sitrep',
    schema: {
      type: 'object',
      title: 'Situation Report',
      properties: {
        title: {
          type: 'string',
          title: 'Report Title'
        },
        urgency: {
          type: 'number',
          title: 'Urgency Level',
          minimum: 1,
          maximum: 10,
          default: 5
        },
        description: {
          type: 'string',
          title: 'Situation Description'
        },
        location: {
          type: 'string',
          title: 'Location'
        }
      },
      required: ['title', 'description']
    },
    uiSchema: {
      description: {
        'ui:widget': 'textarea',
      }
    }
  },
  {
    id: 'demo-numbers',
    schema: {
        "type": "object",
        "title": "Number fields & widgets",
        "properties": {
          "number": {
            "title": "Number",
            "type": "number"
          },
          "integer": {
            "title": "Integer",
            "type": "integer"
          },
          "numberEnum": {
            "type": "number",
            "title": "Number enum",
            "enum": [
              1,
              2,
              3
            ]
          },
          "numberEnumRadio": {
            "type": "number",
            "title": "Number enum",
            "enum": [
              1,
              2,
              3
            ]
          },
          "integerRange": {
            "title": "Integer range",
            "type": "integer",
            "minimum": -50,
            "maximum": 50
          },
          "integerRangeSteps": {
            "title": "Integer range (by 10)",
            "type": "integer",
            "minimum": 50,
            "maximum": 100,
            "multipleOf": 10
          }
        }
      },
    uiSchema: {
    }
  }
]

export const mockBackend: MockBackend = {
  wargames: [wargame],
  users: [admin, blueCo, redCo, greenCo, blueLogs, redLogs, greenLogs],
  groups: [
    blueForce,
    redForce,
    greenForce,
    umpires
  ],
  chatrooms,
  templates
}