import { CreateParams, CreateResult, DataProvider, DeleteManyResult, DeleteResult, GetListResult, GetManyReferenceResult, GetManyResult, GetOneResult, UpdateManyResult, UpdateParams, UpdateResult } from "react-admin"
import { XMPPService } from "../../services/XMPPService"
import { GameStateType, GamePropertiesType } from "../../types/wargame-d"
import { RGameState } from "./raTypes-d"
import { splitGameState } from "../../helpers/split-game-state"

const STATE_DOC = 'game-state'
const SETUP_DOC = 'game-setup'

const DEFAULT_STATE: GameStateType = {
  turn: '1',
  currentTime: new Date().toISOString(),
  currentPhase: 'Planning'
}

const DEFAULT_SETUP: GamePropertiesType = {
  name: '',
  description: '',
  startTime: new Date().toISOString(),
  stepTime: '1',
  turnType: 'Linear'
}

export const WargameDataProvider = (xmppClient: XMPPService): DataProvider => {
  return {
    getList: async (): Promise<GetListResult> => {      // get the state doc
      const doc = await xmppClient.getPubSubDocument(STATE_DOC)
      const gameState: GameStateType = doc && doc.content?.json ? doc.content.json : DEFAULT_STATE
      // get the setup doc
      const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      const setup: GamePropertiesType = setupDoc && setupDoc.content?.json ? setupDoc.content.json : DEFAULT_SETUP
      const merged: RGameState = { id:'0', ...gameState, ...setup }
      return { data: [merged], total: 1 }
    },
    getOne: async (): Promise<GetOneResult> => {
      // get the state doc
      const doc = await xmppClient.getPubSubDocument(STATE_DOC)
      const gameState: GameStateType = doc && doc.content?.json ? doc.content.json : DEFAULT_STATE
      // get the setup doc
      const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      const setup: GamePropertiesType = setupDoc && setupDoc.content?.json ? setupDoc.content.json : DEFAULT_SETUP
      const merged: RGameState = { id:'0', ...gameState, ...setup }
      return { data: merged }
    },
    getMany: async (): Promise<GetManyResult> => {
      return { data: [] }
    },
    getManyReference: async (): Promise<GetManyReferenceResult> => {
      return { data: [] }
    },
    update: async (resource: string, params: UpdateParams<RGameState>): Promise<UpdateResult> => {
      console.log('resource', resource, params.data)
      // map from R to X
      const { gameProperties, gameState } = splitGameState(params.data as RGameState)

      // store documents
      await xmppClient.publishPubSubLeaf(SETUP_DOC,undefined, gameProperties)
      await xmppClient.publishPubSubLeaf(STATE_DOC,undefined, gameState)
      return { data: params.data }
    },
    updateMany: async (): Promise<UpdateManyResult> => {
      return { data: [] }
    },
    create: async (resource: string, params: CreateParams<RGameState>): Promise<CreateResult> => {
         // map from R to X
         const { gameProperties, gameState } = splitGameState(params.data as RGameState)

         // store documents
         await xmppClient.publishPubSubLeaf(SETUP_DOC,undefined, gameProperties)
         await xmppClient.publishPubSubLeaf(STATE_DOC,undefined, gameState)
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

export default WargameDataProvider
