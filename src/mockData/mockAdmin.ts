import { RGroup, RRoom, RUser } from "../components/AdminView/raTypes-d"

interface MockBackend {
  users: RUser[],
  groups: RGroup[],
  chatrooms: RRoom[]
}

const admin: RUser = {id: 'admin', name: 'admin', email: 'admin'}
const blueCo: RUser = {id: 'blue-co', name: 'blue-co', email: 'blue-co'}
const redCo: RUser = {id: 'red-co', name: 'red-co', email: 'red-co'}
const greenCo: RUser = {id: 'green-co', name: 'green-co', email: 'green-co'}
const blueLogs: RUser = {id: 'blue-logs', name: 'blue-logs', email: 'blue-logs'}
const redLogs: RUser = {id: 'red-logs', name: 'red-logs', email: 'red-logs'}
const greenLogs: RUser = {id: 'green-logs', name: 'green-logs', email: 'green-logs'}
const blueForce: RGroup = {id: 'blue', name: 'Umpire', description: 'blue', members: [blueCo.id, blueLogs.id]}
const redForce: RGroup = {id: 'red', name: 'Umpire', description: 'red', members: [redCo.id, redLogs.id]}
const greenForce: RGroup = {id: 'green', name: 'Umpire', description: 'green', members: [greenCo.id, greenLogs.id]}
const umpires: RGroup = {id: 'umpire', name: 'Umpire', description: 'umpire', members: [admin.id]}
export const mockBackend: MockBackend = {
  users: [admin, blueCo, redCo, greenCo, blueLogs, redLogs, greenLogs],
  groups: [
    blueForce,
    redForce,
    greenForce,
    umpires
  ],
  chatrooms: [
    {id: 'blue-chat', name: 'blue chat', description: 'blue', memberForces:[blueForce.id]},
    {id: 'red-chat', name: 'red chat', description: 'red', memberForces:[redForce.id]},
    {id: 'green-chat', name: 'green chat', description: 'green', memberForces:[greenForce.id]},
    {id: 'umpire-chat', name: 'umpire chat', description: 'umpire', memberForces:[umpires.id]},
    {id: 'logs-chat', name: 'logs chat', description: 'logs', members: [blueLogs.id, redLogs.id, greenLogs.id]},
    {id: '__admin', name: '__admin', description: '__admin', public: true}
  ]
}