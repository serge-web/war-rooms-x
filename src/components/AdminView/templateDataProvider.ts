import { CreateParams, CreateResult, DataProvider, DeleteManyResult, DeleteParams, DeleteResult, GetListResult, GetManyReferenceResult, GetManyResult, GetOneParams, GetOneResult, QueryFunctionContext, RaRecord, UpdateManyResult, UpdateParams, UpdateResult } from "react-admin"
import { XMPPService } from "../../services/XMPPService"
import { Template } from "../../types/rooms-d"
import { RTemplate } from "./raTypes-d"

const TEMPLATE_COLLECTION = 'templates'
const TEMPLATE_PREFIX = 'template:'

const emptyTemplate = { 
  id: 'pending',
  schema: { title: 'pending', type: 'object', properties: {} }, uiSchema: {}
}


export const TemplateDataProvider = (xmppClient: XMPPService): DataProvider => {
  return {
    getList: async (): Promise<GetListResult> => {  
      // start off with the collection
      const doc = await xmppClient.client?.getDiscoItems(xmppClient.pubsubService || '', TEMPLATE_COLLECTION)
      if (!doc) {
        // no templates, drop out
        return { data: [], total: 0 }
      }
      // now get the items in the collection
      const getItems = doc.items.map(async (item) => {
        const id = (item.node || '')
        return await xmppClient.getPubSubDocument(id)
      })
      const items = await Promise.all(getItems)
      const docs = items.map(d => d?.content?.json as Template)
      return { data: docs, total: docs.length }
    },
    getOne: async (_resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
      const doc = await xmppClient.getPubSubDocument(TEMPLATE_PREFIX + params.id)
      const template: Template = doc && doc.content?.json ? doc.content.json : emptyTemplate
      return { data: template }
    },
    getMany: async (): Promise<GetManyResult> => {
      throw new Error('getMany not supported for templates')
    },
    getManyReference: async (): Promise<GetManyReferenceResult> => {
      throw new Error('getManyReference not supported for templates')
    },
    update: async (_resource: string, params: UpdateParams<Template>): Promise<UpdateResult> => {
      console.log('about to update', params)
      const updated = await xmppClient.updatePubSubDocument(TEMPLATE_PREFIX + params.data.id, params.data)
      console.log('node updated', updated)
      if (!updated.success) {
        throw new Error('Failed to update template.' + updated.error)
      }
      return { data: params.data }
    },
    updateMany: async (): Promise<UpdateManyResult> => {
      throw new Error('updateMany not supported for templates')
    },
    create: async (_resource: string, params: CreateParams<Template>): Promise<CreateResult> => {
      // check for collection
      console.log('creating', params.data)
      const doc = await xmppClient.checkPubSubNodeExists(TEMPLATE_COLLECTION)
      console.log('collection', doc)
      if (!doc) {
        // create collection
        const res = await xmppClient.createPubSubCollection(TEMPLATE_COLLECTION)
        console.log('create collection', res)
        if (!res.success) {
          throw new Error('Failed to create templates collection.' + res.error)
        }
      }

      // ok, now the node]
      if (!params.data.id) {
        throw new Error('Template must have an id')
      }
      console.log('about to publish template')
      const newNode = await xmppClient.publishPubSubLeaf(TEMPLATE_PREFIX + params.data.id, TEMPLATE_COLLECTION, params.data)
      console.log('new node', newNode)
      if (!newNode.success) {
        throw new Error('Failed to create template.' + newNode.error)
      }
      return { data: params.data }    
    },
    delete: async (_resource: string, params: DeleteParams<RTemplate>) => {
      const deleted = await xmppClient.deletePubSubDocument(TEMPLATE_PREFIX + params.id)
      console.log('node deleted', deleted)
      if (!deleted.success) {
        throw new Error('Failed to delete template.' + deleted.error)
      }
      return { data: null }
    },
    deleteMany: async (): Promise<DeleteManyResult> => {
      return { data: [] }
    },
  }
}

export default TemplateDataProvider
