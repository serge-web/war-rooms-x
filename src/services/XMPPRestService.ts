import axios, { AxiosError, AxiosInstance } from 'axios'
import { OpenfireConfig } from '../utils/config'

/**
 * Group/Force representation from OpenFire
 */
export interface Group {
  name: string
  description?: string
}

/**
 * User representation from OpenFire
 */
export interface User {
  username: string
  name?: string
  email?: string
  properties?: Record<string, string>
}

/**
 * Room/Channel representation from OpenFire
 */
export interface Room {
  roomName: string
  naturalName?: string
  description?: string
  subject?: string
  persistent?: boolean
  publicRoom?: boolean
  registrationEnabled?: boolean
  canAnyoneDiscoverJID?: boolean
  canOccupantsChangeSubject?: boolean
  canOccupantsInvite?: boolean
  canChangeNickname?: boolean
  logEnabled?: boolean
  loginRestrictedToNickname?: boolean
  membersOnly?: boolean
  moderated?: boolean
  broadcastPresenceRoles?: string[]
  owners?: string[]
  admins?: string[]
  members?: string[]
  outcasts?: string[]
  maxUsers?: number
  creationDate?: string
  modificationDate?: string
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
    const { ip, port, apiPath, secure } = config
    const protocol = secure ? 'https' : 'http'
    this.baseUrl = `${protocol}://${ip}:${port}${apiPath}`
    
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
    // dotenv.config()

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
      // dotenv.config()
      
      // Use provided secret key or load from environment
      const apiKey = secretKey
      
      if (!apiKey) {
        this.setError('REST API secret key not found in .env file', 'SECRET_KEY_MISSING', 0)
        this.authenticated = false
        return false
      }
      
      // Set Authorization header with the secret key
      this.client.defaults.headers.common['Authorization'] = apiKey
      
      // Test authentication by making a simple request
      const response = await this.client.get('/groups')
      
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
   * Get a list of rooms/channels from the OpenFire server
   * @param serviceName Optional service name to filter rooms by
   * @param type Optional type of rooms to retrieve ('all' by default)
   * @param search Optional search term to filter rooms by name
   * @returns Promise resolving to a RestApiResult containing the rooms
   */
  async getRooms(serviceName?: string, type: 'all' | 'public' | 'private' = 'all', search?: string): Promise<RestApiResult> {
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
      // Build the query parameters
      const queryParams = new URLSearchParams()
      if (serviceName) {
        queryParams.append('servicename', serviceName)
      }
      if (type) {
        queryParams.append('type', type)
      }
      if (search) {
        queryParams.append('search', search)
      }

      // Construct the URL with query parameters
      const url = `/chatrooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await this.client.get(url)
      
      if (response.status === 200) {
        this.clearError()
        // Handle the response based on the OpenFire REST API structure
        // The response might be an array directly or might be wrapped in an object
        let rooms: Room[] = []
        
        if (Array.isArray(response.data)) {
          rooms = response.data as Room[]
        } else if (response.data && typeof response.data === 'object') {
          // Check if there's a chatrooms property or if the object itself contains room data
          if (Array.isArray(response.data.chatrooms)) {
            rooms = response.data.chatrooms
          } else if (Array.isArray(response.data.chatroom)) {
            rooms = response.data.chatroom
          } else {
            // Try to extract rooms from the response object
            const possibleRooms = Object.values(response.data)
            if (possibleRooms.length > 0 && Array.isArray(possibleRooms[0])) {
              rooms = possibleRooms[0] as Room[]
            }
          }
        }
        
        return {
          success: true,
          statusCode: response.status,
          data: {
            rooms
          }
        }
      }
      
      this.setError('Failed to retrieve rooms', 'RETRIEVE_FAILED', response.status)
      return {
        success: false,
        error: 'Failed to retrieve rooms',
        errorCode: 'RETRIEVE_FAILED',
        statusCode: response.status
      }
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error retrieving rooms from REST API'
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

  /**
   * Get a list of users from the OpenFire server
   * @returns Promise resolving to a RestApiResult containing the users
   */
  async getUsers(): Promise<RestApiResult> {
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
      const response = await this.client.get('/users')
      
      if (response.status === 200) {
        this.clearError()
        // Handle the response based on the OpenFire REST API structure
        // The response might be an array directly or might be wrapped in an object
        let users: User[] = []
        
        if (Array.isArray(response.data)) {
          users = response.data as User[]
        } else if (response.data && typeof response.data === 'object') {
          // Check if there's a users property or if the object itself contains user data
          if (Array.isArray(response.data.users)) {
            users = response.data.users
          } else if (Array.isArray(response.data.user)) {
            users = response.data.user
          } else {
            // Try to extract users from the response object
            const possibleUsers = Object.values(response.data)
            if (possibleUsers.length > 0 && Array.isArray(possibleUsers[0])) {
              users = possibleUsers[0] as User[]
            }
          }
        }
        
        return {
          success: true,
          statusCode: response.status,
          data: {
            users
          }
        }
      }
      
      this.setError('Failed to retrieve users', 'RETRIEVE_FAILED', response.status)
      return {
        success: false,
        error: 'Failed to retrieve users',
        errorCode: 'RETRIEVE_FAILED',
        statusCode: response.status
      }
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error retrieving users from REST API'
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

  /**
   * Create a new user on the OpenFire server
   * @param username The username for the new user
   * @param password The password for the new user
   * @param name Optional name for the user
   * @param email Optional email for the user
   * @param properties Optional additional properties for the user
   * @returns Promise resolving to a RestApiResult containing the created user
   */
  async createUser(username: string, password: string, name?: string, email?: string, properties?: Record<string, string>): Promise<RestApiResult> {
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
      // Create the user object
      const userData: User = {
        username,
        name,
        email,
        properties
      }

      // Add the password separately since it's not part of the User interface
      const userWithPassword = {
        ...userData,
        password
      }

      const response = await this.client.post('/users', userWithPassword)
      
      if (response.status === 201 || response.status === 200) {
        this.clearError()
        return {
          success: true,
          statusCode: response.status,
          data: {
            user: userData
          }
        }
      }
      
      this.setError('Failed to create user', 'CREATE_FAILED', response.status)
      return {
        success: false,
        error: 'Failed to create user',
        errorCode: 'CREATE_FAILED',
        statusCode: response.status
      }
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error creating user on REST API'
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

  /**
   * Delete a user from the OpenFire server
   * @param username The username of the user to delete
   * @returns Promise resolving to a RestApiResult indicating success or failure
   */
  async deleteUser(username: string): Promise<RestApiResult> {
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
      const response = await this.client.delete(`/users/${username}`)
      
      if (response.status === 200 || response.status === 204) {
        this.clearError()
        return {
          success: true,
          statusCode: response.status
        }
      }
      
      this.setError('Failed to delete user', 'DELETE_FAILED', response.status)
      return {
        success: false,
        error: 'Failed to delete user',
        errorCode: 'DELETE_FAILED',
        statusCode: response.status
      }
    } catch (error) {
      const axiosError = error as AxiosError
      let errorMessage = 'Error deleting user from REST API'
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
      
      // console.error(errorMessage, error)
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
