import { RGroup, RRoom, RUser } from "../components/AdminView/raTypes-d"

interface MockBackend {
  users: RUser[],
  groups: RGroup[],
  chatrooms: RRoom[]
}
export const mockBackend: MockBackend = {
  users: [],
  groups: [],
  chatrooms: []
}