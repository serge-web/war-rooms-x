/**
 * Utility functions for network operations
 */

/**
 * Check if a server is reachable
 * @param host The host to check
 * @param port The port to check (default: 80)
 * @param timeout Timeout in milliseconds (default: 2000)
 * @returns Promise that resolves to true if server is reachable, false otherwise
 */
export const isServerReachable = async (
  host: string,
  port = 80,
  timeout = 2000
): Promise<boolean> => {
  try {
    // Create a socket connection to test if server is reachable
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      // We're just checking if the server responds, not actually fetching content
      // Using fetch with HEAD method to minimize data transfer
      const url = `http://${host}${port !== 80 ? `:${port}` : ''}`
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      })
      
      return response.ok || response.status < 500
    } catch {
      return false
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    return false
  }
}
