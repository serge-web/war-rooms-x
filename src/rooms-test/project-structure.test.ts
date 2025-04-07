import * as fs from 'fs'
import * as path from 'path'
import fetch from 'node-fetch'

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
  // and that we can successfully connect to it using the REST API
  test('has OpenFire configuration and server is running', async () => {
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    expect(openfireConfig).toHaveProperty('restApiEnabled', true)
    expect(openfireConfig).toHaveProperty('pubsubEnabled', true)
    expect(openfireConfig).toHaveProperty('mucEnabled', true)
    
    try {
      // Attempt to connect to OpenFire REST API to verify it's running
      const { host, port, apiPath, credentials } = openfireConfig
      
      const baseUrl = `http://${host}:${port}${apiPath}`
      const authHeader = 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
      
      // Test connection by fetching server info
      const response = await fetch(`${baseUrl}/system/properties`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toBeDefined()
      
    } catch (error) {
      console.error('OpenFire connectivity test failed:', error)
      throw error
    }
  })
})
