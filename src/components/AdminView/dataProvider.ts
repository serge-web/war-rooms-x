import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateParams } from "react-admin"
import { XMPPRestService } from "../../services/XMPPRestService"
import { mappers } from "./raHelpers"
import { RGroup, RUser, RRoom, XGroup, XRoom, XUser } from "./raTypes-d"

const mapResourceToResults = (resource: string): string => {
  switch(resource) {
  case 'chatrooms': return 'chatrooms'
  default: return resource  
  }
}

const customRoute = (resource :string): string => {
  switch(resource) {
  case 'chatrooms': return 'chatrooms?type=all'
  default: return resource  
  }
}

type AllRTypes = RGroup & RUser & RRoom
type AllXTypes = XGroup & XUser & XRoom


export default (client: XMPPRestService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList:  async  (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    const res = await client.getClient()?.get('/' + customRoute(resource))
    if (!res) {
      return { data: [], total: 0 }
    }
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [], total: 0 }
    }
    const resourceTidied = mapResourceToResults(resource)
    const mapped: RaRecord[] = res?.data[resourceTidied].map((r: XGroup | XUser | XRoom) => mapper.toRRecord(r as AllXTypes))
    console.log('got list complete', resource, params, res, mapped)
    return { data: mapped, total: mapped.length }
  },
  // get a single record by id
  getOne: async (resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
    const res = await client.getClient()?.get('/' + resource + '/' + params.id)
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: null }
    }
    const asR = mapper.toRRecord(res?.data)
    console.log('got one complete', resource, res, asR)
    return { data: asR }
  }, 
  // get a list of records based on an array of ids
  getMany:  async <RecordType extends RaRecord>(resource: string, params: GetManyParams & QueryFunctionContext): Promise<{data: RecordType[]}> => {
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [] }
    }
    const modifiedIds = params.ids.map(id => mapper.modifyId ? mapper.modifyId(id) : id)
    const getPromises = modifiedIds.map(id => client.getClient()?.get('/' + resource + '/' + id))
    const results = await Promise.all(getPromises)
    const asR = results.map((r, index) => mapper.toRRecord(r?.data, params.ids[index])) as RecordType[]
    console.log('got many complete', resource, results, asR)
    return { data: asR }
  }, 
  // get the records referenced to another record, e.g. comments for a post
  getManyReference: async (resource: string, params: GetManyReferenceParams & QueryFunctionContext) => {
    // Use proper filtering by target field
    const res = await client.getClient()?.get(`/${resource}?${params.target}=${params.id}`)
    return { data: res?.data, total: res?.data?.length }
  }, 
  // create a record
  create: async <RecordType extends RaRecord>(resource: string, params: CreateParams): Promise<{data: RecordType}> => {
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    const asX = mapper.toXRecord(params.data as AllRTypes)
    const filledIn = mapper.forCreate ? mapper.forCreate(asX as AllXTypes) : asX
    await client.getClient()?.post('/' + resource, filledIn)
    const asR = mapper.toRRecord(filledIn as AllXTypes)
    console.log('create complete', resource, params.data, filledIn, asR)
    return { data: asR as RecordType }
  }, 
  // update a record based on a patch
  update: async <RecordType extends RaRecord>(resource: string, params: UpdateParams): Promise<{data: RecordType}> => {
    // convert RaRecord to ResourceData
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    const resourceData = mapper.toXRecord(params.data as AllRTypes)
    const current = await client.getClient()?.get('/' + resource + '/' + params.id)
    const newResource = { ...current?.data, ...resourceData }
    console.log('about to update', resource, params.data, newResource)
    await client.getClient()?.put('/' + resource + '/' + params.id, newResource)
    const asR = mapper.toRRecord(newResource as AllXTypes)
    console.log('update complete', resource, params.data, newResource, asR)
    return { data: asR as RecordType }
  }, 
  // update a list of records based on an array of ids and a common patch
  updateMany: async (resource: string, params: UpdateManyParams) => {
    const res = await client.getClient()?.put('/' + resource + '/' + params.ids, params.data)
    console.log('update many complete', resource, params, res)
    return { data: res?.data }
  }, 
  // delete a record by id
  delete: async (resource: string, params: DeleteParams) => {
    const res = await client.getClient()?.delete('/' + resource + '/' + params.id)
    console.log('delete complete', resource, params, res)
    return { data: res?.data }
  }, 
  // delete a list of records based on an array of ids
  deleteMany: async (resource: string, params: DeleteManyParams) => {
    const deletePromises = params.ids.map(id => client.getClient()?.delete('/' + resource + '/' + id))
    const results = await Promise.all(deletePromises)
    const asR = results.map(r => r?.data)
    console.log('delete many complete', resource, params, results, asR)
    return { data: asR }
  }, 
})