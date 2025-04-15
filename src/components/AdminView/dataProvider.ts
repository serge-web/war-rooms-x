import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateParams } from "react-admin"
import { Group, Room, User, XMPPRestService } from "../../services/XMPPRestService"

// Define mapper functions for each resource type
const mapGroupResultsToRecord = (result: Group): RaRecord => {
  const members = result.members || []
  const memberNames = members.map((m) => m.split('@')[0]).join(', ')
  console.log('member names', members, memberNames)
  return {
    id: result.name,
    description: result.description,
    members: memberNames
  }
}

const mapRecordToGroup = (result: RaRecord): Group => {
  return {
    name: result.id as string,
    description: result.description
  }
}

const mapUserToRecord = (result: User): RaRecord => {
  return {
    id: result.username,
    name: result.name
  }
}

const mapRecordToUser = (result: RaRecord): User => {
  return {
    username: result.id as string,
    name: result.name
  }
}

const mapRoomToRecord = (result: Room): RaRecord => {
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

const mapRecordToRoom = (result: RaRecord): Room => {
  return {
    roomName: result.id as string,
    naturalName: result.name
  }
}
  

// Define a union type for all possible resource data types
type ResourceData = Group | User | Room

// Define our mappers with an index signature to allow string indexing
// Using unknown instead of any for better type safety
const toRecordMappers: { [key: string]: (result: ResourceData) => RaRecord } = {
  'groups': mapGroupResultsToRecord as (result: ResourceData) => RaRecord,
  'users': mapUserToRecord as (result: ResourceData) => RaRecord,
  'chatrooms': mapRoomToRecord as (result: ResourceData) => RaRecord
}

const toResourceMappers: { [key: string]: (result: RaRecord) => ResourceData } = {
  'groups': mapRecordToGroup as (result: RaRecord) => ResourceData,
  'users': mapRecordToUser as (result: RaRecord) => ResourceData,
  'chatrooms': mapRecordToRoom as (result: RaRecord) => ResourceData
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
    console.log('result', resource, res)
    const mapper = toRecordMappers[resource]
    if (!mapper) {
      return { data: [], total: 0 }
    }
    const resourceTidied = mapResourceToResults(resource)
    const mapped: RaRecord[] = res?.data[resourceTidied].map(mapper)
    return { data: mapped, total: mapped.length }
  },
  // get a single record by id
  getOne: async (resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
    const res = await client.getClient()?.get('/' + resource + '/' + params.id)
    console.log('get one', resource, params.id, res)
    const mapper = toRecordMappers[resource]
    if (!mapper) {
      return { data: null }
    }
    return { data: mapper(res?.data) }
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
  create: async (resource: string, params: CreateParams) => {
    const res = await client.getClient()?.post('/' + resource, params.data)
    return { data: res?.data }
  }, 
  // update a record based on a patch
  update: async <RecordType extends RaRecord>(resource: string, params: UpdateParams): Promise<{data: RecordType}> => {
    // convert RaRecord to ResourceData
    const mapper = toResourceMappers[resource]
    if (!mapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    console.log('about to convert', resource, params.data)
    const resourceData = mapper(params.data as RaRecord)
    const current = await client.getClient()?.get('/' + resource + '/' + params.id)
    const newResource = { ...current?.data, ...resourceData }
    console.log('converted', newResource)
    const res = await client.getClient()?.put('/' + resource + '/' + params.id, newResource)
    const restateId = {id: params.id, ...newResource}
    delete (restateId as Partial<Group>).name
    console.log('updated', res)
    return { data: params.data as RecordType }
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