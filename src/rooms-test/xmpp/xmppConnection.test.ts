import { XMPPService } from '../../services/XMPPService.js'
import { loadOpenfireConfig } from '../../utils/config.js'
import { isServerReachable } from '../../utils/network.js'

describe('XMPP Connection', () => {
  let xmppService: XMPPService
  let serverAvailable = false
  let openfireConfig: ReturnType<typeof loadOpenfireConfig>

  beforeEach(async () => {
    xmppService = new XMPPService()
    openfireConfig = loadOpenfireConfig()
    
    // Check if server is available
    console.log('Checking if server is available', openfireConfig.ip)
    serverAvailable = await isServerReachable(openfireConfig.ip, 7070)
    
    if (!serverAvailable) {
      console.log(`XMPP server at ${openfireConfig.wsurl} is not reachable, skipping test`)
    }
  })

  afterEach(async () => {
    // Only disconnect if we were connected
    if (serverAvailable && xmppService.isConnected()) {
      await xmppService.disconnect()
    }
  })

  it('should connect to the XMPP server using credentials from openfire.json', async () => {
    // Skip test if server is not available
    if (!serverAvailable) {
      return
    }
    
    // Arrange
    const { ip, host, credentials } = openfireConfig
    const { username, password } = credentials[0] // Use the first credential (admin)

    // Act
    const connected = await xmppService.connect(ip, host, username, password)

    // Assert
    expect(connected).toBe(true)
    expect(xmppService.isConnected()).toBe(true)
    expect(xmppService.getJID()).toContain(username)
  })
})
