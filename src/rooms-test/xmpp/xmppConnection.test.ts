import { XMPPService } from '../../rooms-api/xmpp/XMPPService'
import { loadOpenfireConfig } from '../../utils/config'

describe('XMPP Connection', () => {
  let xmppService: XMPPService

  beforeEach(() => {
    xmppService = new XMPPService()
  })

  afterEach(async () => {
    await xmppService.disconnect()
  })

  it('should connect to the XMPP server using credentials from openfire.json', async () => {
    // Arrange
    const openfireConfig = loadOpenfireConfig()
    const { host, credentials } = openfireConfig
    const { username, password } = credentials

    // Act
    const connected = await xmppService.connect(host, username, password)

    // Assert
    expect(connected).toBe(true)
    expect(xmppService.isConnected()).toBe(true)
    expect(xmppService.getJID()).toContain(username)
  })
})
