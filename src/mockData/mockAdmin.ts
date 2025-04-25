import { RGameState, RGroup, RRoom, RUser } from "../components/AdminView/raTypes-d"

interface MockBackend {
  wargames: RGameState[],
  users: RUser[],
  groups: RGroup[],
  chatrooms: RRoom[]
}

const admin: RUser = {id: 'admin', name: 'Game Control', email: 'admin'}
const blueCo: RUser = {id: 'blue-co', name: 'Blue CO', email: 'blue-co'}
const redCo: RUser = {id: 'red-co', name: 'Red CO', email: 'red-co'}
const greenCo: RUser = {id: 'green-co', name: 'Green CO', email: 'green-co'}
const blueLogs: RUser = {id: 'blue-logs', name: 'Blue Logs', email: 'blue-logs'}
const redLogs: RUser = {id: 'red-logs', name: 'Red Logs', email: 'red-logs'}
const greenLogs: RUser = {id: 'green-logs', name: 'Green Logs', email: 'green-logs'}
const blueForce: RGroup = {id: 'blue', name: 'Blue', description: 'Blue Force', members: [blueCo.id, blueLogs.id]}  
const redForce: RGroup = {id: 'red', name: 'Red', description: 'Red Force', members: [redCo.id, redLogs.id]}
const greenForce: RGroup = {id: 'green', name: 'Green', description: 'Green Force', members: [greenCo.id, greenLogs.id]}
const umpires: RGroup = {id: 'umpire', name: 'Umpire', description: 'Umpire Force', members: [admin.id]}
const wargame: RGameState ={
  id: '1',
  name: 'Wargame',
  startTime: new Date().toISOString(),
  stepTime: '1H30M',
  turnType: 'Linear',
  turn: '1',
  currentTime: new Date().toISOString(),
  currentPhase: 'phase',
  theme: {}
}
const chatrooms: RRoom[] = [
  {id: 'blue-chat', name: 'blue chat', description: 'blue', memberForces:[blueForce.id]},
  {id: 'red-chat', name: 'red chat', description: 'red', memberForces:[redForce.id]},
  {id: 'green-chat', name: 'green chat', description: 'green', memberForces:[greenForce.id]},
  {id: 'umpire-chat', name: 'umpire chat', description: 'umpire', memberForces:[umpires.id]},
  {id: 'logs-chat', name: 'logs chat', description: 'logs', members: [blueLogs.id, redLogs.id, greenLogs.id], memberForces:[umpires.id]},
  {id: '__admin', name: '__admin', description: '__admin', public: true}
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
  chatrooms
}