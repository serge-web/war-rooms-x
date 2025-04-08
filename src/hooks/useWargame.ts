import { useState, useEffect } from 'react'
import { createClient } from 'stanza'

// Define types for Stanza client
interface StanzaClient {
  on: (event: string, callback: (data: Record<string, unknown>) => void) => void
  connect: () => void
  disconnect: () => void
  pubsub: {
    subscribe: (node: string) => Promise<unknown>
    getItems: (node: string) => Promise<{ items: Array<{ content: { json: unknown } }> }>
  }
}

// Define types for our wargame state
type Force = {
  id: string
  name: string
}

type WargameStatus = 'inactive' | 'active' | 'paused' | 'completed'

type Wargame = {
  id: string
  title: string
  status: WargameStatus
  forces: Force[]
  currentTurn: number
  startTime: string | null
  endTime: string | null
}

type WargameHookResult = {
  wargame: Wargame
  isLoading: boolean
  error: string | null
}

export const useWargame = (): WargameHookResult => {
  // Initialize with default state
  const [wargame, setWargame] = useState<Wargame>({
    id: '',
    title: '',
    status: 'inactive',
    forces: [],
    currentTurn: 0,
    startTime: null,
    endTime: null
  })
  
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create XMPP client
    const client = createClient({
      jid: 'user@example.com', // This would be replaced with actual user credentials
      password: 'password',    // This would be replaced with actual user credentials
      resource: 'war-rooms-x'
    }) as unknown as StanzaClient

    // Handle connection events
    client.on('session:started', () => {
      // Subscribe to wargame PubSub node
      setIsLoading(true)
      // Using the pubsub API from the client
      client.pubsub.subscribe('wargame')
        .then(() => {
          setIsLoading(false)
          // Fetch initial wargame data
          return client.pubsub.getItems('wargame')
        })
        .then((result: { items?: Array<{ content?: { json?: Wargame } }> }) => {
          if (result.items && result.items.length > 0) {
            const latestItem = result.items[0]
            if (latestItem.content && latestItem.content.json) {
              setWargame(latestItem.content.json)
            }
          }
        })
        .catch((err: Error) => {
          setIsLoading(false)
          setError(`Failed to subscribe to wargame updates: ${err.message}`)
        })
    })

    // Handle PubSub events
    client.on('pubsub:event', (event: Record<string, unknown>) => {
      const node = event.node as string | undefined
      const items = event.items as Array<{ content?: { json?: unknown } }> | undefined
      
      if (node === 'wargame' && items && items.length > 0) {
        const item = items[0]
        if (item.content?.json) {
          setWargame(item.content.json as Wargame)
        }
      }
    })

    // Connect to XMPP server
    client.connect()

    // Cleanup function
    return () => {
      client.disconnect()
    }
  }, []) // Empty dependency array means this effect runs once on mount

  return { wargame, isLoading, error }
}
