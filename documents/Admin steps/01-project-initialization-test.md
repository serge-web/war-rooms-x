# Phase 0: Project Initialization Test

'As a DevOps Engineer, specializing in React and TypeScript, it is your goal to write tests that verify the project structure has been correctly initialized. You will write the test first, then execute `yarn test` and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.'

## Test Requirements

Create a test file `src/rooms-test/project-structure.test.ts` that verifies:

1. Project structure follows the standard monolith architecture
2. React + Tailwind + React Router are properly configured
3. OpenFire server is properly set up with required plugins
4. Service modules exist and are properly structured:
   - `services/xmpp` (StanzaJS wrapper)
   - `services/openfire` (admin API wrapper)
   - `schema` (template metadata + game models)

## Test Implementation

```typescript
import fs from 'fs'
import path from 'path'

describe('Project Structure', () => {
  // Test project structure follows standard monolith architecture
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
  })

  // Test React + Tailwind + React Router configuration
  test('has required frontend dependencies', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
    )
    
    const requiredDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      'tailwindcss'
    ]
    
    requiredDeps.forEach(dep => {
      expect(
        Object.keys(packageJson.dependencies).includes(dep) || 
        Object.keys(packageJson.devDependencies).includes(dep)
      ).toBe(true)
    })
  })

  // Test service modules exist
  test('has required service modules', () => {
    const requiredServices = [
      'src/services/xmpp',
      'src/services/openfire',
      'src/schema'
    ]
    
    requiredServices.forEach(service => {
      expect(fs.existsSync(path.resolve(process.cwd(), service))).toBe(true)
    })
  })

  // Test OpenFire configuration
  test('has OpenFire configuration', () => {
    const openfireConfigPath = path.resolve(process.cwd(), 'config/openfire.json')
    expect(fs.existsSync(openfireConfigPath)).toBe(true)
    
    const openfireConfig = JSON.parse(fs.readFileSync(openfireConfigPath, 'utf8'))
    expect(openfireConfig).toHaveProperty('restApiEnabled', true)
    expect(openfireConfig).toHaveProperty('pubsubEnabled', true)
    expect(openfireConfig).toHaveProperty('mucEnabled', true)
  })
})
```
