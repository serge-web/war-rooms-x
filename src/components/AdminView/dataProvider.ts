import { CreateParams, CreateResult, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateParams } from "react-admin"
import { XMPPRestService } from "../../services/XMPPRestService"
import { mappers } from "./raHelpers"
import { RGroup, RUser, RRoom, XGroup, XRoom, XUser } from "./raTypes-d"
import { XMPPService } from "../../services/XMPPService"

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

type AllRTypes = RGroup & RUser & RRoom
type AllXTypes = XGroup & XUser & XRoom


export default (restClient: XMPPRestService, xmppClient: XMPPService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList:  async  (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    const res = await restClient.getClient()?.get('/' + customRoute(resource))
    if (!res) {
      return { data: [], total: 0 }
    }
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [], total: 0 }
    }
    const resourceTidied = mapResourceToResults(resource)
    const mapped: (RaRecord | Promise<RaRecord>)[] = res?.data[resourceTidied].map((r: XGroup | XUser | XRoom) => mapper.toRRecord(r as AllXTypes, undefined, xmppClient, false))
    // whether a promise or a record was returned, we can resolve it
    const results = await Promise.all(mapped)
    console.log('got list complete', resource, params, res, results)
    return { data: results, total: results.length }
  },
  // get a single record by id
  getOne: async (resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
    const res = await restClient.getClient()?.get('/' + resource + '/' + params.id)
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: null }
    }
    const asR = mapper.toRRecord(res?.data, params.id, xmppClient, true)
    const result: (RaRecord | Promise<RaRecord>) = await Promise.resolve(asR)
    console.log('got one complete', resource, res, result)
    return { data: result }
  }, 
  // get a list of records based on an array of ids
  getMany:  async <RecordType extends RaRecord>(resource: string, params: GetManyParams & QueryFunctionContext): Promise<{data: RecordType[]}> => {
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [] }
    }
    const modifiedIds = params.ids.map(id => mapper.modifyId ? mapper.modifyId(id) : id)
    const getPromises = modifiedIds.map(id => restClient.getClient()?.get('/' + resource + '/' + id))
    const results = await Promise.all(getPromises)
    const asR = results.map((r, index) => mapper.toRRecord(r?.data, params.ids[index], xmppClient, false) as RaRecord) as RecordType[]
    console.log('got many complete', resource, results, asR, params)
    return { data: asR }
  }, 
  // get the records referenced to another record, e.g. comments for a post
  getManyReference: async (resource: string, params: GetManyReferenceParams & QueryFunctionContext) => {
    // Use proper filtering by target field
    const res = await restClient.getClient()?.get(`/${resource}?${params.target}=${params.id}`)
    return { data: res?.data, total: res?.data?.length }
  }, 
  // create a record
  create: async <RecordType extends RaRecord>(resource: string, params: CreateParams): Promise<CreateResult<RecordType>> => {
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    const asX = mapper.toXRecord(params.data as AllRTypes, params.data.id, xmppClient)
    const filledIn = mapper.forCreate ? mapper.forCreate(asX as AllXTypes) : asX
    await restClient.getClient()?.post('/' + resource, filledIn)
    console.log('about to convert to RaRecord', filledIn, params.data.id)
    const asR = await mapper.toRRecord(filledIn as AllXTypes, params.data.id, xmppClient, true)
    console.log('create complete', resource, params.data, filledIn, asR)
    const result = await Promise.resolve(asR) as AllRTypes
    return { data: result as unknown as RecordType }
  }, 
  // update a record based on a patch
  update: async <RecordType extends RaRecord>(resource: string, params: UpdateParams): Promise<{data: RecordType}> => {
    // convert RaRecord to ResourceData
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    const resourceData = await mapper.toXRecord(params.data as AllRTypes, params.id, xmppClient)
    await Promise.resolve(resourceData)
    console.log('updated resource', resourceData)
    const current = await restClient.getClient()?.get('/' + resource + '/' + params.id)
    const newResource = { ...current?.data, ...resourceData }
    await restClient.getClient()?.put('/' + resource + '/' + params.id, newResource)
    const asR = await mapper.toRRecord(newResource as AllXTypes, params.id, xmppClient, true)
    const results = await Promise.resolve(asR)
    console.log('update complete', resource, params.data, newResource, results)
    return { data: results as unknown as RecordType }
  }, 
  // update a list of records based on an array of ids and a common patch
  updateMany: async (resource: string, params: UpdateManyParams) => {
    const res = await restClient.getClient()?.put('/' + resource + '/' + params.ids, params.data)
    console.log('update many complete', resource, params, res)
    return { data: res?.data }
  }, 
  // delete a record by id
  delete: async (resource: string, params: DeleteParams) => {
    const res = await restClient.getClient()?.delete('/' + resource + '/' + params.id)
    console.log('delete complete', resource, params, res)
    return { data: res?.data }
  }, 
  // delete a list of records based on an array of ids
  deleteMany: async (resource: string, params: DeleteManyParams) => {
    const deletePromises = params.ids.map(id => restClient.getClient()?.delete('/' + resource + '/' + id))
    const results = await Promise.all(deletePromises)
    const asR = results.map(r => r?.data)
    console.log('delete many complete', resource, params, results, asR)
    return { data: asR }
  }, 
})