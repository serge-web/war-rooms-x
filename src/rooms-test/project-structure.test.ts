import * as fs from 'fs'
import * as path from 'path'
import * as XMPP from 'stanza'

describe('Project Structure', () => {
  // Test project structure follows Vite.js-based monolith architecture
  test('has correct base folder structure', () => {
    const requiredDirs = [
      'src',
      'src/rooms-test',
      'public',
      'documents'
    ]
    
    requiredDirs.forEach(dir => {
      expect(fs.existsSync(path.resolve(process.cwd(), dir))).toBe(true)
    })
    
    // Verify Vite.js specific files
    const requiredFiles = [
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      'tsconfig.test.json',
      '.prettierrc',
      '.prettierignore',
      'src/main.tsx',
      'src/App.tsx',
      'src/vite-env.d.ts'
    ]
    
    requiredFiles.forEach(file => {
      expect(fs.existsSync(path.resolve(process.cwd(), file))).toBe(true)
    })
  })

  // Test Vite.js + React + React Router + Prettier configuration
  test('has required frontend dependencies', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
    )
    
    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'vite',
      'prettier'
    ]
    
    requiredDeps.forEach(dep => {
      expect(
        Object.keys(packageJson.dependencies).includes(dep) || 
        Object.keys(packageJson.devDependencies).includes(dep)
      ).toBe(true)
    })
  })
  
  // Test Prettier configuration
  test('has valid Prettier configuration', () => {
    const prettierConfigPath = path.resolve(process.cwd(), '.prettierrc')
    expect(fs.existsSync(prettierConfigPath)).toBe(true)
    
    const prettierConfig = JSON.parse(fs.readFileSync(prettierConfigPath, 'utf8'))
    expect(prettierConfig).toHaveProperty('singleQuote', true)
    expect(prettierConfig).toHaveProperty('semi', false)
  })

  // Test service modules exist
  test('has required service modules', () => {
    const requiredServices = [
      'src/components',
      'src/hooks',
      'src/types'
    ]
    
    requiredServices.forEach(service => {
      expect(fs.existsSync(path.resolve(process.cwd(), service))).toBe(true)
    })
  })

  // Test OpenFire connectivity via VM
  // This test verifies that an OpenFire server is running in a VM and accessible via XMPP
  test('OpenFire server is running in VM and accessible', async () => {
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    const { host, credentials } = openfireConfig
    const { username, password } = credentials[0] // Use the first credential (admin)
    
    try {
      // Create XMPP client
      const xmpp = XMPP.createClient({
        server: host,
        transports: {
          websocket: `ws://${host}:7070/ws`
        },
        jid: `${username}@${host}/test-connection`,
        password: password
      })
      
      // Set up event handlers with proper error handling
      const connectionPromise = new Promise<boolean>((resolve) => {
        // Set a timeout for connection attempt
        const timeout = setTimeout(() => {
          try {
            xmpp.disconnect()
          } catch {
            // Ignore errors during stop
          }
          console.log('OpenFire connection timed out - server may not be running')
          resolve(false)
        }, 5000)
        
        xmpp.on('session:started', async () => {
          clearTimeout(timeout)
          console.log('Successfully connected to OpenFire server')
          try {
            xmpp.disconnect()
          } catch {
            // Ignore errors during stop
          }
          resolve(true)
        })
        
        xmpp.on('stream:error', (err: { condition?: string }) => {
          clearTimeout(timeout)
          console.log(`OpenFire connection error: ${err.condition || JSON.stringify(err)}`)
          try {
            xmpp.disconnect()
          } catch {
            // Ignore errors during stop
          }
          resolve(false)
        })
      })
      
      // Start connection with error handling
      try {
        xmpp.connect()
      } catch (err) {
        console.log(`Failed to start XMPP connection: ${(err as Error).message}`)
        return
      }
      
      // Wait for connection to complete or fail
      const connected = await connectionPromise
      
      // Verify OpenFire is accessible
      if (!connected) {
        throw new Error('Could not connect to OpenFire server')
      }
      
      expect(connected).toBe(true)
      
    } catch (error) {
      console.error('OpenFire XMPP connectivity test error:', error)
      throw error
    }
  })
})
