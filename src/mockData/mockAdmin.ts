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
const blueForce: RGroup = {id: 'blue', name: 'Blue', description: 'Own forces', members: [blueCo.id, blueLogs.id]}  
const redForce: RGroup = {id: 'red', name: 'Red', description: 'Opponent forces', members: [redCo.id, redLogs.id]}
const greenForce: RGroup = {id: 'green', name: 'Green', description: 'Friendly forces', members: [greenCo.id, greenLogs.id]}
const umpires: RGroup = {id: 'umpire', name: 'Umpire', description: 'Umpire Force (adjudicators)', members: [admin.id]}
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
const createMessage = (id: string, senderId: string, senderName: string, senderForce: string, content: string, timestamp: string): GameMessage => {
  const details: MessageDetails = {
    messageType: 'chat',
    senderId,
    senderName,
    senderForce,
    turn: wargame.turn,
    phase: wargame.currentPhase,
    timestamp,
    channel: ''
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
  createMessage('blue-msg-1', blueCo.id, blueCo.name, blueForce.id, 'Team, let\'s review our current position and plan our next move.', timestamps[0]),
  createMessage('blue-msg-2', blueLogs.id, blueLogs.name, blueForce.id, 'Supply status: Ammunition at 85%, fuel at 70%, medical supplies at 90%.', timestamps[1]),
  createMessage('blue-msg-3', blueCo.id, blueCo.name, blueForce.id, 'Good. What\'s our ETA for the next resupply?', timestamps[2]),
  createMessage('blue-msg-4', blueLogs.id, blueLogs.name, blueForce.id, 'Resupply scheduled in 6 hours if weather holds.', timestamps[3]),
  createMessage('blue-msg-5', blueCo.id, blueCo.name, blueForce.id, 'We need to secure the eastern flank before then. Let\'s move Alpha team into position.', timestamps[4]),
  createMessage('blue-msg-6', blueCo.id, blueCo.name, blueForce.id, 'Any intel on enemy movements in sector 4?', timestamps[5]),
  createMessage('blue-msg-7', blueLogs.id, blueLogs.name, blueForce.id, 'Negative. Reconnaissance drones will be operational in 30 minutes.', timestamps[6])
]

// Blue C2 messages
const blueC2Messages: GameMessage[] = [
  createMessage('blue-c2-msg-1', blueCo.id, blueCo.name, blueForce.id, 'Command, we need authorization for artillery support in grid reference 45-89.', timestamps[0]),
  createMessage('blue-c2-msg-2', blueCo.id, blueCo.name, blueForce.id, 'Enemy forces spotted moving toward our southern position.', timestamps[2]),
  createMessage('blue-c2-msg-3', blueCo.id, blueCo.name, blueForce.id, 'Requesting air support for defensive operation.', timestamps[3]),
  createMessage('blue-c2-msg-4', blueLogs.id, blueLogs.name, blueForce.id, 'Air support ETA 15 minutes. Prepare targeting coordinates.', timestamps[4]),
  createMessage('blue-c2-msg-5', blueCo.id, blueCo.name, blueForce.id, 'Roger that. Coordinates being transmitted on secure channel.', timestamps[5]),
  createMessage('blue-c2-msg-6', blueLogs.id, blueLogs.name, blueForce.id, 'Be advised, weather conditions may affect air support effectiveness.', timestamps[7])
]

// Red chat messages
const redMessages: GameMessage[] = [
  createMessage('red-msg-1', redCo.id, redCo.name, redForce.id, 'Our reconnaissance indicates Blue Force is preparing for an offensive.', timestamps[0]),
  createMessage('red-msg-2', redLogs.id, redLogs.name, redForce.id, 'Current supply levels: Ammunition at 65%, fuel at 80%, medical at 75%.', timestamps[1]),
  createMessage('red-msg-3', redCo.id, redCo.name, redForce.id, 'We need to reinforce our defensive positions immediately.', timestamps[2]),
  createMessage('red-msg-4', redLogs.id, redLogs.name, redForce.id, 'Moving additional units to the western perimeter.', timestamps[3]),
  createMessage('red-msg-5', redCo.id, redCo.name, redForce.id, 'Prepare counter-offensive strategies. We\'ll discuss in the next briefing.', timestamps[4]),
  createMessage('red-msg-6', redLogs.id, redLogs.name, redForce.id, 'Electronic warfare systems are online and operational.', timestamps[6]),
  createMessage('red-msg-7', redCo.id, redCo.name, redForce.id, 'Good. Monitor Blue Force communications and report any actionable intelligence.', timestamps[8])
]

// Red C2 messages
const redC2Messages: GameMessage[] = [
  createMessage('red-c2-msg-1', redCo.id, redCo.name, redForce.id, 'Command, requesting permission to deploy special operations team to sector 7.', timestamps[1]),
  createMessage('red-c2-msg-2', redCo.id, redCo.name, redForce.id, 'Intelligence suggests high-value target in the area.', timestamps[2]),
  createMessage('red-c2-msg-3', redLogs.id, redLogs.name, redForce.id, 'Permission granted. Extraction plan is being finalized.', timestamps[3]),
  createMessage('red-c2-msg-4', redCo.id, redCo.name, redForce.id, 'Team Alpha is ready for deployment. ETA to target: 45 minutes.', timestamps[5]),
  createMessage('red-c2-msg-5', redLogs.id, redLogs.name, redForce.id, 'Be advised, satellite imagery shows increased enemy activity in adjacent sectors.', timestamps[7]),
  createMessage('red-c2-msg-6', redCo.id, redCo.name, redForce.id, 'Understood. We\'ll adjust our approach accordingly.', timestamps[9])
]

// Green chat messages
const greenMessages: GameMessage[] = [
  createMessage('green-msg-1', greenCo.id, greenCo.name, greenForce.id, 'Maintaining neutrality in the current conflict is our priority.', timestamps[0]),
  createMessage('green-msg-2', greenLogs.id, greenLogs.name, greenForce.id, 'Humanitarian aid distribution is proceeding as planned.', timestamps[1]),
  createMessage('green-msg-3', greenCo.id, greenCo.name, greenForce.id, 'We need additional security for the aid convoys.', timestamps[3]),
  createMessage('green-msg-4', greenLogs.id, greenLogs.name, greenForce.id, 'Requesting escort from peacekeeping forces for tomorrow\'s convoy.', timestamps[4]),
  createMessage('green-msg-5', greenCo.id, greenCo.name, greenForce.id, 'Approved. Coordinate with local authorities for route security.', timestamps[5]),
  createMessage('green-msg-6', greenLogs.id, greenLogs.name, greenForce.id, 'Medical supplies are running low. Prioritizing distribution to critical areas.', timestamps[7]),
  createMessage('green-msg-7', greenCo.id, greenCo.name, greenForce.id, 'Acknowledged. Let\'s request an emergency resupply from headquarters.', timestamps[9])
]

// Umpire chat messages
const umpireMessages: GameMessage[] = [
  createMessage('umpire-msg-1', admin.id, admin.name, umpires.id, 'All forces, be advised: weather conditions will deteriorate in the next 6 hours.', timestamps[0]),
  createMessage('umpire-msg-2', admin.id, admin.name, umpires.id, 'Blue Force artillery strike in sector 3 has been adjudicated. Results will be communicated separately.', timestamps[2]),
  createMessage('umpire-msg-3', admin.id, admin.name, umpires.id, 'Red Force special operations mission outcome: partial success. Details forthcoming.', timestamps[4]),
  createMessage('umpire-msg-4', admin.id, admin.name, umpires.id, 'Reminder: next turn submissions due in 2 hours.', timestamps[5]),
  createMessage('umpire-msg-5', admin.id, admin.name, umpires.id, 'Green Force humanitarian mission has been approved and will proceed as planned.', timestamps[6]),
  createMessage('umpire-msg-6', admin.id, admin.name, umpires.id, 'All forces: scenario update will be provided at the next briefing.', timestamps[8])
]

// Logistics chat messages
const logsMessages: GameMessage[] = [
  createMessage('logs-msg-1', blueLogs.id, blueLogs.name, blueForce.id, 'All logistics officers, please provide your current supply status.', timestamps[0]),
  createMessage('logs-msg-2', redLogs.id, redLogs.name, redForce.id, 'Red Force: Ammunition at 65%, fuel at 80%, medical at 75%.', timestamps[1]),
  createMessage('logs-msg-3', blueLogs.id, blueLogs.name, blueForce.id, 'Blue Force: Ammunition at 85%, fuel at 70%, medical at 90%.', timestamps[2]),
  createMessage('logs-msg-4', greenLogs.id, greenLogs.name, greenForce.id, 'Green Force: Medical supplies at 50%, food at 65%, shelter materials at 40%.', timestamps[3]),
  createMessage('logs-msg-5', redLogs.id, redLogs.name, redForce.id, 'Weather forecast indicates potential supply route disruptions. Recommend stockpiling critical supplies.', timestamps[5]),
  createMessage('logs-msg-6', blueLogs.id, blueLogs.name, blueForce.id, 'Agreed. We should coordinate our resupply missions to maximize efficiency.', timestamps[6]),
  createMessage('logs-msg-7', greenLogs.id, greenLogs.name, greenForce.id, 'Green Force priority is medical supplies. Can either of you spare any?', timestamps[7]),
  createMessage('logs-msg-8', blueLogs.id, blueLogs.name, blueForce.id, 'We can provide some medical supplies. Will coordinate transfer details offline.', timestamps[8])
]

// Admin messages
const adminMessages: GameMessage[] = [
  createMessage('admin-msg-1', admin.id, admin.name, umpires.id, 'System maintenance scheduled for tonight at 02:00. Expect 30 minutes downtime.', timestamps[0]),
  createMessage('admin-msg-2', admin.id, admin.name, umpires.id, 'New scenario parameters have been uploaded to the system.', timestamps[2]),
  createMessage('admin-msg-3', admin.id, admin.name, umpires.id, 'Reminder: All participants must submit their action plans before the deadline.', timestamps[4]),
  createMessage('admin-msg-4', admin.id, admin.name, umpires.id, 'Technical issue with the mapping system has been resolved.', timestamps[6]),
  createMessage('admin-msg-5', admin.id, admin.name, umpires.id, 'Next game session will begin tomorrow at 09:00. All participants must be logged in by 08:45.', timestamps[8])
]

const chatrooms: RRoom[] = [
  {id: 'blue-chat', name: 'blue chat', description: 'Blue Force discussions', memberForces:[blueForce.id], dummyMessages: blueMessages},
  {id: 'blue-c2', name: 'blue c2', description: 'Blue command and control discussions', memberForces:[blueForce.id], dummyMessages: blueC2Messages},
  {id: 'red-chat', name: 'red chat', description: 'Red force discussions', memberForces:[redForce.id], dummyMessages: redMessages},
  {id: 'red-c2', name: 'red c2', description: 'Red command and control discussions', memberForces:[redForce.id], dummyMessages: redC2Messages},
  {id: 'green-chat', name: 'green chat', description: 'Green force discussions', memberForces:[greenForce.id], dummyMessages: greenMessages},
  {id: 'umpire-chat', name: 'umpire chat', description: 'Umpire force discussions, about game-play and rules', memberForces:[umpires.id], dummyMessages: umpireMessages},
  {id: 'logs-chat', name: 'Logistics Debate', description: 'Logistics Debate, across forces, discussing logistic issues', members: [blueLogs.id, redLogs.id, greenLogs.id], memberForces:[umpires.id], dummyMessages: logsMessages},
  {id: '__admin', name: '__admin', description: 'Game administration', public: true, dummyMessages: adminMessages}
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
      urgency: {
        'ui:widget': 'range'
      },
      description: {
        'ui:widget': 'textarea',
        'ui:options': {
          rows: 5
        }
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
      "integer": {
        "ui:widget": "updown"
      },
      "numberEnumRadio": {
        "ui:widget": "radio",
        "ui:options": {
          "inline": true
        }
      },
      "integerRange": {
        "ui:widget": "range"
      },
      "integerRangeSteps": {
        "ui:widget": "range"
      }
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