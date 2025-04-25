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
const blueForce: RGroup = {id: 'blue', name: 'Blue', description: 'Own forces', members: [blueCo.id, blueLogs.id]}  
const redForce: RGroup = {id: 'red', name: 'Red', description: 'Opponent forces', members: [redCo.id, redLogs.id]}
const greenForce: RGroup = {id: 'green', name: 'Green', description: 'Friendly forces', members: [greenCo.id, greenLogs.id]}
const umpires: RGroup = {id: 'umpire', name: 'Umpire', description: 'Umpire Force (adjudicators)', members: [admin.id]}
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
  {id: 'blue-chat', name: 'blue chat', description: 'Blue Force discussions', memberForces:[blueForce.id]},
  {id: 'blue-c2', name: 'blue c2', description: 'Blue command and control discussions', memberForces:[blueForce.id]},
  {id: 'red-chat', name: 'red chat', description: 'Red force discussions', memberForces:[redForce.id]},
  {id: 'red-c2', name: 'red c2', description: 'Red command and control discussions', memberForces:[redForce.id]},
  {id: 'green-chat', name: 'green chat', description: 'Green force discussions', memberForces:[greenForce.id]},
  {id: 'umpire-chat', name: 'umpire chat', description: 'Umpire force discussions, about game-play and rules', memberForces:[umpires.id]},
  {id: 'logs-chat', name: 'Logistics Debate', description: 'Logistics Debate, across forces, discussing logistic issues', members: [blueLogs.id, redLogs.id, greenLogs.id], memberForces:[umpires.id]},
  {id: '__admin', name: '__admin', description: 'Game administration', public: true}
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