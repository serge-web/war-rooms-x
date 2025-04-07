import * as fs from 'fs'
import * as path from 'path'
import { client } from '@xmpp/client'

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

  // Test OpenFire configuration and connectivity
  // This test verifies that an OpenFire server is installed and running (likely in a Docker container)
  // and that we can successfully connect to it using XMPP via websockets
  test('has OpenFire configuration and server is running', async () => {
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    expect(openfireConfig).toHaveProperty('restApiEnabled', true)
    expect(openfireConfig).toHaveProperty('pubsubEnabled', true)
    expect(openfireConfig).toHaveProperty('mucEnabled', true)
    
    try {
      // Attempt to connect to OpenFire server via XMPP websockets to verify it's running
      const { host, credentials } = openfireConfig
      
      // Create XMPP client
      const xmpp = client({
        service: `ws://${host}:7070/ws`,
        domain: host,
        username: credentials.username,
        password: credentials.password,
        resource: 'test-connection'
      })
      
      // Set up event handlers
      const connectionPromise = new Promise((resolve, reject) => {
        // Set a timeout for connection attempt
        const timeout = setTimeout(() => {
          xmpp.stop()
          reject(new Error('Connection timeout'))
        }, 5000)
        
        xmpp.on('online', async () => {
          clearTimeout(timeout)
          resolve(true)
          await xmpp.stop()
        })
        
        xmpp.on('error', (err: Error) => {
          clearTimeout(timeout)
          reject(err)
        })
      })
      
      // Start connection
      await xmpp.start()
      
      // Wait for connection to complete or fail
      await connectionPromise
      
      // If we get here, the connection was successful
      expect(true).toBe(true)
      
    } catch (error) {
      console.error('OpenFire XMPP connectivity test failed:', error)
      throw error
    }
  })
})
