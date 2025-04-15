import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateParams } from "react-admin"
import { Group, XMPPRestService } from "../../services/XMPPRestService"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom } from "./raTypes"

// Define mapper functions for each resource type
const mapGroupResultsToRecord = (result: XGroup): RGroup => {
  return {
    id: result.name,
    description: result.description,
    members: result.members
  }
}

const mapRecordToGroup = (result: RGroup): XGroup => {
  return {
    name: result.id as string,
    description: result.description
  }
}

const mapUserToRecord = (result: XUser): RUser => {
  return {
    id: result.username,
    name: result.name
  }
}

const mapRecordToUser = (result: RUser): XUser => {
  return {
    username: result.id as string,
    name: result.name
  }
}

const mapRoomToRecord = (result: XRoom): RRoom => {
  return {
    id: result.roomName,
    name: result.naturalName || 'pending',
    description: result.description,
    members: result.members,
    memberForces: result.memberGroups
  }
}

const mapRecordToRoom = (result: RRoom): XRoom => {
  return {
    roomName: result.id as string,
    naturalName: result.name,
    description: result.description,
    members: result.members,
    memberGroups: result.memberForces
  }
}
  

// Define a union type for all possible resource data types
type XResourceData = (XGroup | XUser | XRoom)
type RResourceData = (RGroup | RUser | RRoom)

// Define our mappers with an index signature to allow string indexing
// Using unknown instead of any for better type safety
const toRecordMappers: { [key: string]: (result: XResourceData) => RResourceData } = {
  'groups': mapGroupResultsToRecord as (result: XGroup) => RGroup,
  'users': mapUserToRecord as (result: XUser) => RUser,
  'chatrooms': mapRoomToRecord as (result: XRoom) => RRoom
}

const toResourceMappers: { [key: string]: (result: RResourceData) => XResourceData } = {
  'groups': mapRecordToGroup as (result: RGroup) => XGroup,
  'users': mapRecordToUser as (result: RUser) => XUser,
  'chatrooms': mapRecordToRoom as (result: RRoom) => XRoom
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
    const resourceData = mapper(params.data as RResourceData)
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