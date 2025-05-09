import { XTemplate } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { Template } from '../../../types/rooms-d'
import { ResourceHandler } from './types'
import { TemplateDataProvider } from '../Resources/templateDataProvider'

export const TemplateMapper: ResourceHandler<XTemplate, Template> = {
  resource: 'templates',
  provider: (xmppClient: XMPPService) => TemplateDataProvider(xmppClient)
}
