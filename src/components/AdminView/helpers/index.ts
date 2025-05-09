import { GroupMapper } from './groupMapper'
import { RoomMapper } from './roomMapper'
import { UserMapper } from './userMapper'
import { WargameMapper } from './wargameMapper'
import { TemplateMapper } from './templateMapper'
import { ResourceHandler } from './types'
import { XGroup, RGroup, XUser, RUser, XRoom, RRoom, XGameState, RGameState } from '../raTypes-d'
import { XTemplate } from '../raTypes-d'
import { Template } from '../../../types/rooms-d'

export * from './types'
export * from './groupMapper'
export * from './roomMapper'
export * from './userMapper'
export * from './wargameMapper'
export * from './templateMapper'

// Define the AnyResourceHandler type locally
type AnyResourceHandler = 
  | ResourceHandler<XGroup, RGroup>
  | ResourceHandler<XRoom, RRoom>
  | ResourceHandler<XUser, RUser>
  | ResourceHandler<XGameState, RGameState>
  | ResourceHandler<XTemplate, Template>

export const mappers: AnyResourceHandler[] = [
  GroupMapper,
  RoomMapper,
  UserMapper,
  WargameMapper,
  TemplateMapper
]
