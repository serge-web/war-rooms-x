import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateParams } from "react-admin"
import { XMPPRestService } from "../../services/XMPPRestService"
import { toRMappers, toXMappers } from "./raHelpers"
import { RResourceData } from "./raTypes-d"

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


export default (client: XMPPRestService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList:  async  (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    const res = await client.getClient()?.get('/' + customRoute(resource))
    if (!res) {
      return { data: [], total: 0 }
    }
    console.log('got list', resource, params, res)
    const mapper = toRMappers[resource]
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
    console.log('got one', resource, params, res)
    const mapper = toRMappers[resource]
    if (!mapper) {
      return { data: null }
    }
    return { data: mapper(res?.data) }
  }, 
  // get a list of records based on an array of ids
  getMany:  async (resource: string, params: GetManyParams & QueryFunctionContext) => {
    const getPromises = params.ids.map(id => client.getClient()?.get('/' + resource + '/' + id))
    const results = await Promise.all(getPromises)
    console.log('got many', resource, params, results)
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
    const xMapper = toXMappers[resource]
    if (!xMapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    const resourceData = xMapper(params.data as RResourceData)
    const current = await client.getClient()?.get('/' + resource + '/' + params.id)
    const newResource = { ...current?.data, ...resourceData }
    console.log('converted', params.data, current?.data, newResource)
    const res = await client.getClient()?.put('/' + resource + '/' + params.id, newResource)
    const rMapper = toRMappers[resource]
    if (!rMapper) {
      // Return the original data instead of null to match the expected return type
      return { data: params.data as RecordType }
    }
    return { data: rMapper(res?.data) as RecordType }
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