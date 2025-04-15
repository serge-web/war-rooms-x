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
    console.log('got list', resource, params, res)
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [], total: 0 }
    }
    const resourceTidied = mapResourceToResults(resource)
    const mapped: RaRecord[] = res?.data[resourceTidied].map(mapper.toRRecord)
    return { data: mapped, total: mapped.length }
  },
  // get a single record by id
  getOne: async (resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
    const res = await client.getClient()?.get('/' + resource + '/' + params.id)
    console.log('got one', resource, params, res)
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: null }
    }
    return { data: mapper.toRRecord(res?.data) }
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
    console.log('got many', resource, results, params.ids)
    const asR = results.map((r, index) => mapper.toRRecord(r?.data, params.ids[index])) as RecordType[]
    console.log('about to return xRecords', asR)
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
    console.log('about to post', filledIn)
    await client.getClient()?.post('/' + resource, filledIn)
    const asR = mapper.toRRecord(filledIn as AllXTypes)
    console.log('created', asR)
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
    console.log('converted', params.data, current?.data, newResource)
    await client.getClient()?.put('/' + resource + '/' + params.id, newResource)
    const asR = mapper.toRRecord(newResource as AllXTypes)
    console.log('converted back', asR)
    return { data: asR as RecordType }
  }, 
  // update a list of records based on an array of ids and a common patch
  updateMany: async (resource: string, params: UpdateManyParams) => {
    const res = await client.getClient()?.put('/' + resource + '/' + params.ids, params.data)
    return { data: res?.data }
  }, 
  // delete a record by id
  delete:     async (resource: string, params: DeleteParams) => {
    console.log('about to delete', resource, params)
    const res = await client.getClient()?.delete('/' + resource + '/' + params.id)
    console.log('result', res)
    return { data: res?.data }
  }, 
  // delete a list of records based on an array of ids
  deleteMany: async (resource: string, params: DeleteManyParams) => {
    console.log('about to delete many', resource, params)
    const deletePromises = params.ids.map(id => client.getClient()?.delete('/' + resource + '/' + id))
    const results = await Promise.all(deletePromises)
    console.log('bulk delete results', results)
    return { data: results?.map(r => r?.data) }
  }, 
})