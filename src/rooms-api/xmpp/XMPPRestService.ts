import axios, { AxiosError, AxiosInstance } from 'axios'
import { OpenfireConfig } from '../../utils/config'

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
  async authenticate(username: string, password: string): Promise<boolean> {
    if (!this.client) {
      this.setError('REST client not initialized', 'CLIENT_NOT_INITIALIZED', 0)
      throw new Error('REST client not initialized')
    }

    try {
      // Basic authentication for OpenFire REST API
      const authString = Buffer.from(`${username}:${password}`).toString('base64')
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
}
