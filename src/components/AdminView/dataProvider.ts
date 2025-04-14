import { CreateParams, DataProvider, DeleteManyParams, DeleteParams, GetListParams, GetListResult, GetManyParams, GetManyReferenceParams, GetOneParams, QueryFunctionContext, UpdateManyParams, UpdateParams } from "react-admin"
import { Group, XMPPRestService } from "../../services/XMPPRestService"

interface RecordType {
  id: string
  [key: string]: string
}

const mapGroupResultsToRecord = (result: Group) => {
  return {
    id: result.name,
    name: result.name,
    description: result.description
  }
}

export default (client: XMPPRestService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList:  async  (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    console.log('get list', resource, params)
    const res = await client.getClient()?.get('/' + resource)
    if (!res) {
      return { data: [], total: 0 }
    }
    const mapped: RecordType[] = res?.data.groups.map(mapGroupResultsToRecord)
    return { data: mapped, total: mapped.length }
  },
  // get a single record by id
  getOne:    async (resource: string, params: GetOneParams & QueryFunctionContext) => {
    const res = await client.getClient()?.get('/' + resource + '/' + params.id)
    return { data: res?.data }
  }, 
  // get a list of records based on an array of ids
  getMany:  async (resource: string, params: GetManyParams & QueryFunctionContext) => {
    const getPromises = params.ids.map(id => client.getClient()?.get('/' + resource + '/' + id))
    const results = await Promise.all(getPromises)
    return { data: results?.map(r => r?.data) }
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