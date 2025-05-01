import { CreateParams, CreateResult, DataProvider, DeleteManyResult, DeleteResult, GetListResult, GetManyReferenceResult, GetManyResult, GetOneResult, UpdateManyResult, UpdateParams, UpdateResult } from "react-admin"
import { XMPPService } from "../../services/XMPPService"
import { Template } from "../../types/rooms-d"

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
      console.log('templ collection', doc)
      if (!doc) {
        // no templates, drop out
        console.log('no collection found, dropping out')
        return { data: [], total: 0 }
      }
      // now get the items in the collection
      console.log('about to get items')
      const getItems = doc.items.map((item) => {
        return xmppClient.getPubSubDocument(TEMPLATE_PREFIX + item.jid || '')
      })
      const items = await Promise.all(getItems)
      console.log('items', items)
      return { data: items, total: items.length }
      // const gameState: GameStateType = doc && doc.content?.json ? doc.content.json : DEFAULT_STATE
      // // get the setup doc
      // const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      // const setup: GamePropertiesType = setupDoc && setupDoc.content?.json ? setupDoc.content.json : DEFAULT_SETUP
      // const merged: RGameState = mergeGameState(setup, gameState)
      // return { data: [merged], total: 1 }
    },
    getOne: async (): Promise<GetOneResult> => {
      return { data: emptyTemplate }
      // // get the state doc
      // const doc = await xmppClient.getPubSubDocument(STATE_DOC)
      // const gameState: GameStateType = doc && doc.content?.json ? doc.content.json : DEFAULT_STATE
      // // get the setup doc
      // const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      // const setup: GamePropertiesType = setupDoc && setupDoc.content?.json ? setupDoc.content.json : DEFAULT_SETUP
      // const merged: RGameState = mergeGameState(setup, gameState)
      // return { data: merged }
    },
    getMany: async (): Promise<GetManyResult> => {
      return { data: [] }
    },
    getManyReference: async (): Promise<GetManyReferenceResult> => {
      return { data: [] }
    },
    update: async (_resource: string, params: UpdateParams<Template>): Promise<UpdateResult> => {
      // // map from R to X
      // const { gameProperties, gameState } = splitGameState(params.data as RGameState)
      // // store documents
      // await xmppClient.publishPubSubLeaf(SETUP_DOC,undefined, gameProperties)
      // await xmppClient.publishPubSubLeaf(STATE_DOC,undefined, gameState)
      return { data: params.data }
    },
    updateMany: async (): Promise<UpdateManyResult> => {
      return { data: [] }
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
    delete: async (): Promise<DeleteResult> => {
      return { data: null }
    },
    deleteMany: async (): Promise<DeleteManyResult> => {
      return { data: [] }
    },
  }
}

export default TemplateDataProvider
