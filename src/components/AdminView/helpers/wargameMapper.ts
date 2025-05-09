import { RGameState, XGameState } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { ResourceHandler } from './types'
import { CreateParams, CreateResult, DataProvider, DeleteManyResult, DeleteResult, GetListResult, GetManyReferenceResult, GetManyResult, GetOneResult, UpdateManyResult, UpdateParams, UpdateResult } from 'react-admin'
import { mergeGameState, splitGameState } from '../../../helpers/split-game-state'
import { GameStateType, GamePropertiesType } from '../../../types/wargame-d'

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
  interval: '1',
  turnType: 'Linear',
  playerTheme: undefined,
  adminTheme: undefined
}

/**
 * Wargame data provider for React Admin
 * @param xmppClient The XMPP service client
 * @returns A DataProvider for wargames
 */
export const WargameDataProvider = (xmppClient: XMPPService): DataProvider => {
  return {
    getList: async (): Promise<GetListResult> => {      // get the state doc
      const doc = await xmppClient.getPubSubDocument(STATE_DOC)
      const gameState: GameStateType = doc as GameStateType || DEFAULT_STATE
      // get the setup doc
      const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      const setup: GamePropertiesType = setupDoc as GamePropertiesType || DEFAULT_SETUP
      const merged: RGameState = mergeGameState(setup, gameState)
      return { data: [merged], total: 1 }
    },
    getOne: async (): Promise<GetOneResult> => {
      // get the state doc
      const doc = await xmppClient.getPubSubDocument(STATE_DOC)
      const gameState: GameStateType = doc as GameStateType || DEFAULT_STATE
      // get the setup doc
      const setupDoc = await xmppClient.getPubSubDocument(SETUP_DOC)
      const setup: GamePropertiesType = setupDoc as GamePropertiesType || DEFAULT_SETUP
      const merged: RGameState = mergeGameState(setup, gameState)
      return { data: merged }
    },
    getMany: async (): Promise<GetManyResult> => {
      return { data: [] }
    },
    getManyReference: async (): Promise<GetManyReferenceResult> => {
      return { data: [] }
    },
    update: async (_resource: string, params: UpdateParams<RGameState>): Promise<UpdateResult> => {
      // map from R to X
      const { gameProperties, gameState } = splitGameState(params.data as RGameState)
      // store documents
      await xmppClient.publishPubSubLeaf(SETUP_DOC, undefined, gameProperties)
      await xmppClient.publishPubSubLeaf(STATE_DOC, undefined, gameState)
      return { data: params.data }
    },
    updateMany: async (): Promise<UpdateManyResult> => {
      return { data: [] }
    },
    create: async (_resource: string, params: CreateParams<RGameState>): Promise<CreateResult> => {
      // map from R to X
      const { gameProperties, gameState } = splitGameState(params.data as RGameState)

      // store documents
      await xmppClient.publishPubSubLeaf(SETUP_DOC, undefined, gameProperties)
      await xmppClient.publishPubSubLeaf(STATE_DOC, undefined, gameState)
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

/**
 * Resource handler for wargames
 */
export const WargameMapper: ResourceHandler<XGameState, RGameState> = {
  resource: 'wargames',
  provider: WargameDataProvider
}
