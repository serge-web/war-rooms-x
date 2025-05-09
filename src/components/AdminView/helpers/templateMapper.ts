import { XTemplate } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { Template } from '../../../types/rooms-d'
import { ResourceHandler } from './types'
import { CreateParams, CreateResult, DataProvider, DeleteManyParams, DeleteManyResult, DeleteParams, DeleteResult, GetListResult, GetManyParams, GetManyReferenceResult, GetManyResult, GetOneParams, GetOneResult, QueryFunctionContext, UpdateManyResult, UpdateParams, UpdateResult } from 'react-admin'
import { TEMPLATES_COLLECTION, TEMPLATES_PREFIX } from '../../../types/constants'

// Define a properly typed empty template that conforms to the Template type
import { JSONSchema7 } from 'json-schema'

const emptyTemplate: Template = { 
  id: 'pending',
  schema: { title: 'pending', type: 'object', properties: {} } as JSONSchema7, // Cast to JSONSchema7 to satisfy type requirements
  uiSchema: {}
}

/**
 * Template data provider for React Admin
 * @param xmppClient The XMPP service client
 * @returns A DataProvider for templates
 */
export const TemplateDataProvider = (xmppClient: XMPPService): DataProvider => {
  return {
    getList: async (): Promise<GetListResult> => {  
      // start off with the collection
      const doc = await xmppClient.client?.getDiscoItems(xmppClient.pubsubService || '', TEMPLATES_COLLECTION)
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
      const docs = items.map(d => d as Template)
      return { data: docs, total: docs.length }
    },
    getOne: async (_resource: string, params: GetOneParams & QueryFunctionContext): Promise<GetOneResult> => {
      const doc = await xmppClient.getPubSubDocument(TEMPLATES_PREFIX + params.id)
      const template: Template = doc as Template || emptyTemplate
      return { data: template }
    },
    getMany: async (_resource: string, params: GetManyParams): Promise<GetManyResult> => {
      const getActions = params.ids.map(async (id: string) => {
        const doc = await xmppClient.getPubSubDocument(TEMPLATES_PREFIX + id)
        const template: Template = doc as Template || emptyTemplate
        return template
      })
      const templates = await Promise.all(getActions)
      return { data: templates }
    },
    getManyReference: async (): Promise<GetManyReferenceResult> => {
      throw new Error('getManyReference not supported for templates')
    },
    update: async (_resource: string, params: UpdateParams<Template>): Promise<UpdateResult> => {
      const updated = await xmppClient.publishJsonToPubSubNode(TEMPLATES_PREFIX + params.data.id, params.data)
      if (!updated.success) {
        throw new Error('Failed to update template.' + updated.error)
      }
      return { data: params.data }
    },
    updateMany: async (): Promise<UpdateManyResult> => {
      throw new Error('updateMany not supported for templates')
    },
    create: async (_resource: string, params: CreateParams<Template>): Promise<CreateResult> => {
      // check node valid
      if (!params.data.id) {
        throw new Error('Template must have an id')
      }
      const newNode = await xmppClient.publishPubSubLeaf(TEMPLATES_PREFIX + params.data.id, TEMPLATES_COLLECTION, params.data)
      if (!newNode.success) {
        throw new Error('Failed to create template.' + newNode.error)
      }
      return { data: params.data }    
    },
    delete: async (_resource: string, params: DeleteParams): Promise<DeleteResult>=> {
      const deleted = await xmppClient.deletePubSubDocument(TEMPLATES_PREFIX + params.id)
      if (!deleted.success) {
        throw new Error('Failed to delete template.' + deleted.error)
      }
      return { data: null }
    },
    deleteMany: async (_resource: string, params: DeleteManyParams): Promise<DeleteManyResult> => {
      const deleteItems = params.ids.map((id: string) => xmppClient.deletePubSubDocument(TEMPLATES_PREFIX + id))
      const deleted = await Promise.all(deleteItems)
      console.log('node deleted', deleted)
      if (!deleted.some(d => d.success)) {
        throw new Error('Failed to delete template:' + deleted.filter(d => !d.success).map(d => d.error).join(', '))
      }
      return { data: [] }
    },
  }
}

/**
 * Resource handler for templates
 */
export const TemplateMapper: ResourceHandler<XTemplate, Template> = {
  resource: 'templates',
  provider: TemplateDataProvider
}
