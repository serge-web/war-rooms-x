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
export const mockBackend: MockBackend = {
  users: [admin, blueCo, redCo, greenCo, blueLogs, redLogs, greenLogs],
  groups: [
    {id: 'umpire', name: 'Umpire', description: 'blue', members: [admin.id]},
    {id: 'blue', name: 'blue', description: 'blue', members: [blueCo.id, blueLogs.id]},
    {id: 'red', name: 'red', description: 'red', members: [redCo.id, redLogs.id]},
    {id: 'green', name: 'green', description: 'green', members: [greenCo.id, greenLogs.id]}],
  chatrooms: [
    {id: 'blue-chat', name: 'blue chat', description: 'blue', memberForces:[]}
  ]
}