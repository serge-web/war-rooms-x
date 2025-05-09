import { DataProvider, RaRecord } from "react-admin"
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XRecord, RGameState, XGameState, XTemplate } from "./raTypes-d"
import { Template } from "../../types/rooms-d"
import { XMPPService } from "../../services/XMPPService"

// Import all helpers from the new structure
import {
  formatMemberWithHost,
  trimHost,
  mappers
} from './helpers'

// Re-export the utility functions and mappers
export { formatMemberWithHost, trimHost }

// Use a type that can represent any of our resource handlers
export type ResourceHandler<X extends XRecord, R extends RaRecord> = {
  resource: string
  toRRecord?: (result: X, id: string | undefined, xmppClient: XMPPService, verbose: boolean) => R | Promise<R>
  toXRecord?: (result: R, id: string, xmppClient: XMPPService, previousData?: R) => X | Promise<X>
  forCreate?: (result: X) => X
  modifyId?: (id: string) => string
  provider?: (xmppClient: XMPPService) => DataProvider
}

export type AnyResourceHandler = 
  | ResourceHandler<XGroup, RGroup>
  | ResourceHandler<XRoom, RRoom>
  | ResourceHandler<XUser, RUser>
  | ResourceHandler<XGameState, RGameState>
  | ResourceHandler<XTemplate, Template>

// Re-export the mappers
export { mappers }
