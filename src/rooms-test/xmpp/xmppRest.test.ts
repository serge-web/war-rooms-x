import { XMPPRestService, Group } from '../../rooms-api/xmpp/XMPPRestService'
import { loadOpenfireConfig } from '../../utils/config'

describe('XMPP REST API', () => {
  let xmppRestService: XMPPRestService
  let openfireConfig: ReturnType<typeof loadOpenfireConfig>
  let serverAvailable = true

  beforeEach(() => {
    xmppRestService = new XMPPRestService()
    openfireConfig = loadOpenfireConfig()
    xmppRestService.initialize(openfireConfig)
  })

  it('should authenticate with the REST API using credentials from .env file', async () => {
    
    // Act
    // const authenticated = await xmppRestService.authenticateWithSecretKey()
    const authenticated = await xmppRestService.authenticate()

    const error = xmppRestService.getLastError()

    // If test fails, provide diagnostic information
    if (!authenticated) {
      console.log('Authentication failed with the following error:')
      console.log(`- Message: ${error.message}`)
      console.log(`- Code: ${error.code}`)
      console.log(`- Status: ${error.statusCode}`)
      console.log(`- Server URL: ${xmppRestService.getBaseUrl()}`)
      console.log('Please check that:')
      console.log(`1. The OpenFire server is running at ${openfireConfig.host}:${openfireConfig.port}`)
      console.log('2. The REST API plugin is enabled in OpenFire')
      console.log('3. The credentials in openfire.json are correct')
      
      // If connection is refused, conditionally skip the assertions
      if (error.code === 'CONNECTION_REFUSED') {
        serverAvailable = false
        console.warn('SKIPPING TEST: OpenFire server connection refused - server may not be running')
      }
    }

    // Only run assertions if the server is available
    expect(serverAvailable).toBe(true)
    expect(authenticated).toBe(true)
    expect(xmppRestService.isAuthenticated()).toBe(true)
    expect(xmppRestService.getBaseUrl()).toContain(openfireConfig.host)
    expect(xmppRestService.getBaseUrl()).toContain(openfireConfig.port.toString())
    expect(xmppRestService.getBaseUrl()).toContain(openfireConfig.apiPath)
  })

  // it('should fail authentication with invalid credentials', async () => {
  //   // Arrange - using invalid credentials
    
  //   // Act
  //   const authenticated = await xmppRestService.authenticate('invalid-user', 'wrong-password')
  //   const error = xmppRestService.getLastError()
    
  //   // If connection is refused, conditionally skip the assertions
  //   if (error.code === 'CONNECTION_REFUSED') {
  //     serverAvailable = false
  //     console.warn('SKIPPING TEST: OpenFire server connection refused - server may not be running')
  //     return
  //   }

  //   // Only run assertions if the server is available
  //   if (serverAvailable) {
  //     expect(authenticated).toBe(false)
  //     expect(xmppRestService.isAuthenticated()).toBe(false)
  //   } else {
  //     // If server is not available, make the test pass with a conditional assertion
  //     expect(true).toBe(true)
  //   }
  // })

  describe('Group/Force Management', () => {
    beforeEach(async () => {
      // Authenticate before each test in this group
      const authenticated = await xmppRestService.authenticate()
      if (!authenticated) {
        const error = xmppRestService.getLastError()
        if (error.code === 'CONNECTION_REFUSED') {
          serverAvailable = false
          console.warn('SKIPPING TEST: OpenFire server connection refused - server may not be running')
        }
      }
    })

    it('should retrieve a list of groups/forces from the server', async () => {
      // Skip test if server is not available
      if (!serverAvailable) {
        console.warn('SKIPPING TEST: OpenFire server not available')
        expect(true).toBe(true)
        fail()
      }

      // Act
      const result = await xmppRestService.getGroups()
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data?.groups)).toBe(true)
      
      // Verify the structure of the groups
      const groups = result.data?.groups as Group[]
      if (groups.length > 0) {
        const firstGroup = groups[0]
        expect(firstGroup).toHaveProperty('name')
        expect(typeof firstGroup.name).toBe('string')
      }
    })
  })
})
