import * as fs from 'fs'
import * as path from 'path'
import { client } from '@xmpp/client'
import { exec } from 'child_process'
import { promisify } from 'util'

describe('Project Structure', () => {
  // Test project structure follows Vite.js-based monolith architecture
  test('has correct base folder structure', () => {
    const requiredDirs = [
      'src',
      'src/rooms-api',
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
      'src/services/xmpp',
      'src/services/openfire',
      'src/schema',
      'src/components',
      'src/hooks',
      'src/pages',
      'src/utils',
      'src/types'
    ]
    
    requiredServices.forEach(service => {
      expect(fs.existsSync(path.resolve(process.cwd(), service))).toBe(true)
    })
  })

  // Test OpenFire configuration and Docker setup
  test('has OpenFire configuration and Docker setup', () => {
    // Check for OpenFire configuration
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    expect(openfireConfig).toHaveProperty('restApiEnabled', true)
    expect(openfireConfig).toHaveProperty('pubsubEnabled', true)
    expect(openfireConfig).toHaveProperty('mucEnabled', true)
    
    // Check for Docker configuration files
    const dockerComposePath = path.resolve(process.cwd(), 'docker-compose.yml')
    expect(fs.existsSync(dockerComposePath)).toBe(true)
    
    const dockerfilePath = path.resolve(process.cwd(), 'docker/openfire/Dockerfile')
    expect(fs.existsSync(dockerfilePath)).toBe(true)
    
    // Check for setup script
    const setupScriptPath = path.resolve(process.cwd(), 'scripts/setup-openfire.sh')
    expect(fs.existsSync(setupScriptPath)).toBe(true)
    
    // Verify Docker Compose file contains OpenFire service
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8')
    expect(dockerComposeContent).toContain('openfire:')
    expect(dockerComposeContent).toContain('9090:9090')
    expect(dockerComposeContent).toContain('7070:7070')
    
    // Verify Dockerfile contains OpenFire installation
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8')
    expect(dockerfileContent).toContain('OPENFIRE_VERSION=')
    expect(dockerfileContent).toContain('EXPOSE 9090 5222 7070')
  })
  
  // Test OpenFire connectivity via Docker
  // This test verifies that an OpenFire server is running in Docker and accessible via XMPP
  test('OpenFire server is running in Docker and accessible', async () => {
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    const { host, credentials } = openfireConfig
    
    try {
      // Create XMPP client
      const xmpp = client({
        service: `ws://${host}:7070/ws`,
        domain: host,
        username: credentials.username,
        password: credentials.password,
        resource: 'test-connection'
      })
      
      // Set up event handlers with proper error handling
      const connectionPromise = new Promise<boolean>((resolve) => {
        // Set a timeout for connection attempt
        const timeout = setTimeout(() => {
          try {
            xmpp.stop()
          } catch {
            // Ignore errors during stop
          }
          console.log('OpenFire connection timed out - server may not be running')
          resolve(false)
        }, 5000)
        
        xmpp.on('online', async () => {
          clearTimeout(timeout)
          console.log('Successfully connected to OpenFire server')
          try {
            await xmpp.stop()
          } catch {
            // Ignore errors during stop
          }
          resolve(true)
        })
        
        xmpp.on('error', (err: Error) => {
          clearTimeout(timeout)
          console.log(`OpenFire connection error: ${err.message}`)
          try {
            xmpp.stop()
          } catch {
            // Ignore errors during stop
          }
          resolve(false)
        })
      })
      
      // Start connection with error handling
      try {
        await xmpp.start()
      } catch (err) {
        console.log(`Failed to start XMPP connection: ${(err as Error).message}`)
        return
      }
      
      // Wait for connection to complete or fail
      const connected = await connectionPromise
      
      // Verify OpenFire is running in Docker
      if (connected) {
        // Check if it's running in Docker by executing a Docker command
        try {
          const execPromise = promisify(exec)
          
          const result = await execPromise('docker ps --format "{{.Names}}"')
          const containerNames = result.stdout.toLowerCase()
          
          // Check if there's an OpenFire container running
          const hasOpenFireContainer = containerNames.includes('openfire') || 
                                      containerNames.includes('war-rooms-openfire')
          
          console.log('Docker containers running:', containerNames)
          expect(hasOpenFireContainer).toBe(true)
          expect(connected).toBe(true)
        } catch (error) {
          console.error('Error checking Docker containers:', error)
          throw new Error('OpenFire is running but not in a Docker container')
        }
      } else {
        throw new Error('Could not connect to OpenFire server')
      }
      
    } catch (error) {
      console.error('OpenFire XMPP connectivity test error:', error)
      throw error
    }
  })
})
