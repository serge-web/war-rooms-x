import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, UpdateManyParams, UpdateParams } from "react-admin"
import { Group, Room, User, XMPPRestService } from "../../services/XMPPRestService"

interface RecordType {
  id: string
  [key: string]: string | undefined
}

// Define mapper functions for each resource type
const mapGroupResultsToRecord = (result: Group): RecordType => {
  return {
    id: result.name,
    description: result.description
  }
}

const mapUserToRecord = (result: User): RecordType => {
  return {
    id: result.username,
    name: result.name
  }
}

const mapRoomToRecord = (result: Room): RecordType => {
  const forceMembers = result.memberGroups || []
  const members = result.members || []
  const owners = result.owners || []
  const admins = result.admins || []
  const fullList = forceMembers.concat(members).concat(owners).concat(admins)
  const memberNames = fullList.map((m) => m.split('@')[0]).join(', ')
  return {
    id: result.roomName,
    name: result.naturalName,
    members: memberNames
  }
}

// Define a union type for all possible resource data types
type ResourceData = Group | User | Room

// Define our mappers with an index signature to allow string indexing
// Using unknown instead of any for better type safety
const mappers: { [key: string]: (result: ResourceData) => RecordType } = {
  'groups': mapGroupResultsToRecord as (result: ResourceData) => RecordType,
  'users': mapUserToRecord as (result: ResourceData) => RecordType,
  'chatrooms': mapRoomToRecord as (result: ResourceData) => RecordType
}

const mapResourceToResults = (resource: string): string => {
  switch(resource) {
  case 'chatrooms': return 'chatRooms'
  default: return resource  
  }
}

const customRoute = (resource :string): string => {
  switch(resource) {
  case 'chatrooms': return 'chatrooms?type=all'
  default: return resource  
  }
}


export default (client: XMPPRestService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList:  async  (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    console.log('get list', resource, params)
    const res = await client.getClient()?.get('/' + customRoute(resource))
    if (!res) {
      return { data: [], total: 0 }
    }
    console.log('result', res)
    const mapper = mappers[resource]
    if (!mapper) {
      return { data: [], total: 0 }
    }
    const resourceTidied = mapResourceToResults(resource)
    const mapped: RecordType[] = res?.data[resourceTidied].map(mapper)
    return { data: mapped, total: mapped.length }
  },
  // get a single record by id
  getOne: async (resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
    const res = await client.getClient()?.get('/' + resource + '/' + params.id)
    const mapper = mappers[resource]
    if (!mapper) {
      return { data: null }
    }
    return { data: mapper(res?.data[mapResourceToResults(resource)]) }
  }, 
  // get a list of records based on an array of ids
  getMany:  async (resource: string, params: GetManyParams & QueryFunctionContext) => {
    const getPromises = params.ids.map(id => client.getClient()?.get('/' + resource + '/' + id))
    const results = await Promise.all(getPromises)
    return { data: results?.map(r => r?.data[mapResourceToResults(resource)]) }
  }, 
  // get the records referenced to another record, e.g. comments for a post
  getManyReference: async (resource: string, params: GetManyReferenceParams & QueryFunctionContext) => {
    // Use proper filtering by target field
    const res = await client.getClient()?.get(`/${resource}?${params.target}=${params.id}`)
    return { data: res?.data, total: res?.data?.length }
  }, 
  // create a record
  create:     async (resource: string, params: CreateParams) => {
    const res = await client.getClient()?.post('/' + resource, params.data)
    return { data: res?.data }
  }, 
  // update a record based on a patch
  update:     async (resource: string, params: UpdateParams) => {
    const res = await client.getClient()?.put('/' + resource + '/' + params.id, params.data)
    return { data: res?.data }
  }, 
  // update a list of records based on an array of ids and a common patch
  updateMany: async (resource: string, params: UpdateManyParams) => {
    const res = await client.getClient()?.put('/' + resource + '/' + params.ids, params.data)
    return { data: res?.data }
  }, 
  // delete a record by id
  delete:     async (resource: string, params: DeleteParams) => {
    const res = await client.getClient()?.delete('/' + resource + '/' + params.id)
    return { data: res?.data }
  }, 
  // delete a list of records based on an array of ids
  deleteMany: async (resource: string, params: DeleteManyParams) => {
    const res = await client.getClient()?.delete('/' + resource + '/' + params.ids)
    return { data: res?.data }
  }, 
})