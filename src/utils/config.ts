import * as fs from 'fs'
import * as path from 'path'

/**
 * Load the openfire configuration from the config file
 * @returns The openfire configuration object
 */
export const loadOpenfireConfig = () => {
  const configPath = path.resolve(process.cwd(), 'config', 'openfire.json')
  const configData = fs.readFileSync(configPath, 'utf-8')
  return JSON.parse(configData)
}

/**
 * Type definition for the openfire configuration
 */
export interface OpenfireConfig {
  restApiEnabled: boolean
  pubsubEnabled: boolean
  mucEnabled: boolean
  ip: string
  host: string
  port: number
  wsurl: string
  apiPath: string
  secure: boolean
  credentials: {
    username: string
    password: string
  }
  rooms: {
    [key: string]: string
  }
  documents: {
    [key: string]: {
      id: string
      nodeType: string
      access: string
    }
  }
}
