import { useState, useEffect } from 'react'
import { useWargame } from '../contexts/WargameContext'
import { PresenceData } from '../services/types'

interface UserPresence {
  jid: string
  available: boolean
  lastUpdated: number
}

/**
 * Hook to track presence for users in a room
 * @param roomJid The JID of the room to track presence for
 * @returns An object with presence data and utility functions
 */
export function usePresence(roomJid?: string) {
  const { xmppClient } = useWargame()
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to get presence for a specific user
  const getUserPresence = async (userJid: string): Promise<PresenceData> => {
    if (!xmppClient) {
      return { available: false }
    }

    try {
      // Check if we have cached presence data
      const cachedPresence = presenceMap.get(userJid)
      if (cachedPresence) {
        return { available: cachedPresence.available }
      }

      // If we're in mock mode, return a default value
      if (xmppClient === null) {
        // In mock mode, randomly set some users as online
        const isAvailable = Math.random() > 0.3
        
        // Update the presence map with the mock data
        setPresenceMap(prev => {
          const newMap = new Map(prev)
          newMap.set(userJid, {
            jid: userJid,
            available: isAvailable,
            lastUpdated: Date.now()
          })
          return newMap
        })
        
        return { available: isAvailable }
      }

      // Otherwise, request presence from the XMPP server
      try {
        const presence = await xmppClient.getPresence(userJid)
        
        // Update the presence map with the new data
        setPresenceMap(prev => {
          const newMap = new Map(prev)
          newMap.set(userJid, {
            jid: userJid,
            available: presence.available,
            lastUpdated: Date.now()
          })
          return newMap
        })
        
        return presence
      } catch (err) {
        console.error(`Error getting presence for ${userJid}:`, err)
        return { available: false }
      }
    } catch (err) {
      console.error('Error in getUserPresence:', err)
      return { available: false }
    }
  }

  // Set up presence subscription for the room
  useEffect(() => {
    if (!xmppClient || !roomJid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Function to handle presence updates
    const handlePresenceUpdate = (jid: string, available: boolean) => {
      setPresenceMap(prev => {
        const newMap = new Map(prev)
        newMap.set(jid, {
          jid,
          available,
          lastUpdated: Date.now()
        })
        return newMap
      })
    }

    let unsubscribe: (() => void) | undefined

    // Set up subscription to presence updates
    try {
      if (xmppClient !== null) { // Not in mock mode
        unsubscribe = xmppClient.subscribeToPresence(roomJid, handlePresenceUpdate)
      } else {
        // In mock mode, we don't need to subscribe to anything
        setLoading(false)
      }
    } catch (err) {
      console.error('Error subscribing to presence:', err)
      setError('Failed to subscribe to presence updates')
      setLoading(false)
    }

    // Clean up subscription when component unmounts or roomJid changes
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [xmppClient, roomJid])

  // Check if a user is online
  const isUserOnline = (userJid: string): boolean => {
    const presence = presenceMap.get(userJid)
    return presence?.available || false
  }

  // Get all online users
  const getOnlineUsers = (): string[] => {
    return Array.from(presenceMap.entries())
      .filter(([, data]) => data.available)
      .map(([jid]) => jid)
  }

  return {
    getUserPresence,
    isUserOnline,
    getOnlineUsers,
    presenceMap,
    loading,
    error
  }
}
