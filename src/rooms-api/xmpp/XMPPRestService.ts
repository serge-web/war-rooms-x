import axios, { AxiosError, AxiosInstance } from 'axios'
import * as dotenv from 'dotenv'
import { OpenfireConfig } from '../../utils/config'

/**
 * Group/Force representation from OpenFire
 */
export interface Group {
  name: string
  description?: string
}

/**
 * Result of a REST API operation
 */
export interface RestApiResult {
  success: boolean
  error?: string
  errorCode?: string
  statusCode?: number
  data?: Record<string, unknown>
}

/**
 * Service for handling XMPP REST API connections and communications
 */
export class XMPPRestService {
  private client: AxiosInstance | null = null
  private authenticated = false
  private baseUrl = ''
  private lastError: string | null = null
  private lastErrorCode: string | null = null
  private lastStatusCode: number | null = null

  /**
   * Initialize the REST API client
   * @param config The OpenFire configuration
   * @returns void
   */
  initialize(config: OpenfireConfig): void {
    const { host, port, apiPath, secure } = config
    const protocol = secure ? 'https' : 'http'
    this.baseUrl = `${protocol}://${host}:${port}${apiPath}`
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging tests
      timeout: 5000
    })
  }

  /**
   * Authenticate with the REST API
   * @param username The username for authentication
   * @param password The password for authentication
   * @returns Promise resolving to true if authentication was successful
   */
  async authenticate(username?: string, password?: string): Promise<boolean> {
    if (!this.client) {
      this.setError('REST client not initialized', 'CLIENT_NOT_INITIALIZED', 0)
      throw new Error('REST client not initialized')
    }

    // Load environment variables if not already loaded
    dotenv.config()

    // Use provided credentials or load from environment
    const usernameVal = username || process.env.USER_NAME || 'admin'
    const passwordVal = password || process.env.PASSWORD || 'pwd'
    
    try {
      // Basic authentication for OpenFire REST API
      const authString = Buffer.from(`${usernameVal}:${passwordVal}`).toString('base64')
      this.client.defaults.headers.common['Authorization'] = `Basic ${authString}`
      
      // Test authentication by making a simple request
      const response = await this.client.get('/system/properties')
      
      if (response.status === 200) {
        this.authenticated = true
        this.clearError()
        return true
      }
      
      this.setError('Authentication failed', 'AUTH_FAILED', response.status)
      this.authenticated = false
      return false
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error authenticating with REST API'
      let errorCode = 'UNKNOWN_ERROR'
      let statusCode = 0
      
      if (axiosError.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused to ${this.baseUrl}. Make sure the OpenFire server is running and the REST API plugin is enabled.`
        errorCode = 'CONNECTION_REFUSED'
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorMessage = `Connection timed out to ${this.baseUrl}. Check network connectivity and server status.`
        errorCode = 'CONNECTION_TIMEOUT'
      } else if (axiosError.response) {
        errorMessage = `Server returned error: ${axiosError.response.status} ${axiosError.response.statusText}`
        errorCode = 'SERVER_ERROR'
        statusCode = axiosError.response.status
      }
      
      console.error(errorMessage, error)
      this.setError(errorMessage, errorCode, statusCode)
      this.authenticated = false
      return false
    }
  }

  /**
   * Authenticate with the REST API using a secret key from .env file
   * @param secretKey The secret key for authentication (if not provided, will be loaded from .env)
   * @returns Promise resolving to true if authentication was successful
   */
  async authenticateWithSecretKey(secretKey?: string): Promise<boolean> {
    if (!this.client) {
      this.setError('REST client not initialized', 'CLIENT_NOT_INITIALIZED', 0)
      throw new Error('REST client not initialized')
    }

    try {
      // Load environment variables if not already loaded
      dotenv.config()
      
      // Use provided secret key or load from environment
      const apiKey = secretKey || process.env.REST_API_SECRET_KEY
      
      if (!apiKey) {
        this.setError('REST API secret key not found in .env file', 'SECRET_KEY_MISSING', 0)
        this.authenticated = false
        return false
      }
      
      // Set Authorization header with the secret key
      this.client.defaults.headers.common['Authorization'] = apiKey
      
      console.log('AUTH', apiKey, this.client.defaults.headers.common)

      // Test authentication by making a simple request
      const response = await this.client.get('/system/properties')
      
      if (response.status === 200) {
        this.authenticated = true
        this.clearError()
        return true
      }
      
      this.setError('Authentication failed', 'AUTH_FAILED', response.status)
      this.authenticated = false
      return false
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error authenticating with REST API using secret key'
      let errorCode = 'UNKNOWN_ERROR'
      let statusCode = 0
      
      if (axiosError.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused to ${this.baseUrl}. Make sure the OpenFire server is running and the REST API plugin is enabled.`
        errorCode = 'CONNECTION_REFUSED'
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorMessage = `Connection timed out to ${this.baseUrl}. Check network connectivity and server status.`
        errorCode = 'CONNECTION_TIMEOUT'
      } else if (axiosError.response) {
        errorMessage = `Server returned error: ${axiosError.response.status} ${axiosError.response.statusText}`
        errorCode = 'SERVER_ERROR'
        statusCode = axiosError.response.status
      }
      
      console.error(errorMessage, error)
      this.setError(errorMessage, errorCode, statusCode)
      this.authenticated = false
      return false
    }
  }

  /**
   * Check if the client is authenticated with the REST API
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.authenticated
  }

  /**
   * Get the base URL of the REST API
   * @returns The base URL string
   */
  getBaseUrl(): string {
    return this.baseUrl
  }
  
  /**
   * Get the REST API client instance
   * @returns The axios client instance or null if not initialized
   */
  getClient(): AxiosInstance | null {
    return this.client
  }
  
  /**
   * Get the last error information
   * @returns Object containing error message, code, and status code
   */
  getLastError(): { message: string | null, code: string | null, statusCode: number | null } {
    return {
      message: this.lastError,
      code: this.lastErrorCode,
      statusCode: this.lastStatusCode
    }
  }
  
  /**
   * Set error information
   * @param message Error message
   * @param code Error code
   * @param statusCode HTTP status code
   */
  private setError(message: string, code: string, statusCode: number): void {
    this.lastError = message
    this.lastErrorCode = code
    this.lastStatusCode = statusCode
  }
  
  /**
   * Clear error information
   */
  private clearError(): void {
    this.lastError = null
    this.lastErrorCode = null
    this.lastStatusCode = null
  }

  /**
   * Get a list of groups/forces from the OpenFire server
   * @returns Promise resolving to a RestApiResult containing the groups
   */
  async getGroups(): Promise<RestApiResult> {
    if (!this.client) {
      this.setError('REST client not initialized', 'CLIENT_NOT_INITIALIZED', 0)
      return {
        success: false,
        error: 'REST client not initialized',
        errorCode: 'CLIENT_NOT_INITIALIZED'
      }
    }

    if (!this.authenticated) {
      // Try to authenticate first
      const authenticated = await this.authenticate()
      if (!authenticated) {
        return {
          success: false,
          error: 'Not authenticated with the REST API',
          errorCode: 'NOT_AUTHENTICATED',
          statusCode: 401
        }
      }
    }

    try {
      const response = await this.client.get('/groups')
      
      if (response.status === 200) {
        this.clearError()
        // Handle the response based on the OpenFire REST API structure
        // The response might be an array directly or might be wrapped in an object
        let groups: Group[] = []
        
        if (Array.isArray(response.data)) {
          groups = response.data as Group[]
        } else if (response.data && typeof response.data === 'object') {
          // Check if there's a groups property or if the object itself contains group data
          if (Array.isArray(response.data.groups)) {
            groups = response.data.groups
          } else if (Array.isArray(response.data.group)) {
            groups = response.data.group
          } else {
            // Try to extract groups from the response object
            const possibleGroups = Object.values(response.data)
            if (possibleGroups.length > 0 && Array.isArray(possibleGroups[0])) {
              groups = possibleGroups[0] as Group[]
            }
          }
        }
        
        return {
          success: true,
          statusCode: response.status,
          data: {
            groups
          }
        }
      }
      
      this.setError('Failed to retrieve groups', 'RETRIEVE_FAILED', response.status)
      return {
        success: false,
        error: 'Failed to retrieve groups',
        errorCode: 'RETRIEVE_FAILED',
        statusCode: response.status
      }
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error retrieving groups from REST API'
      let errorCode = 'UNKNOWN_ERROR'
      let statusCode = 0
      
      if (axiosError.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused to ${this.baseUrl}. Make sure the OpenFire server is running.`
        errorCode = 'CONNECTION_REFUSED'
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorMessage = `Connection timed out to ${this.baseUrl}. Check network connectivity and server status.`
        errorCode = 'CONNECTION_TIMEOUT'
      } else if (axiosError.response) {
        errorMessage = `Server returned error: ${axiosError.response.status} ${axiosError.response.statusText}`
        errorCode = 'SERVER_ERROR'
        statusCode = axiosError.response.status
      }
      
      console.error(errorMessage, error)
      this.setError(errorMessage, errorCode, statusCode)
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        statusCode: statusCode
      }
    }
  }
}
