import { RGameState, XGameState } from '../raTypes-d'
import { XMPPService } from '../../../services/XMPPService'
import { ResourceHandler } from './types'
import { WargameDataProvider } from '../Resources/wargameDataProvider'

export const WargameMapper: ResourceHandler<XGameState, RGameState> = {
  resource: 'wargames',
  provider: (xmppClient: XMPPService) => WargameDataProvider(xmppClient)
}
