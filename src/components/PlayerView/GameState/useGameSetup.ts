import { useMemo } from 'react'
import { GamePropertiesType } from '../../../types/wargame-d'
import { usePubSub } from '../../../hooks/usePubSub'
import { useWargame } from '../../../contexts/WargameContext'
import { splitGameState } from '../../../helpers/split-game-state'
import { useIndexedDBData } from '../../../hooks/useIndexedDBData'
import { RGameState } from '../../AdminView/raTypes-d'

export const useGameProperties = () => {
  const { document: gamePropertiesDocument } = usePubSub<GamePropertiesType>('game-setup')
  const { xmppClient } = useWargame()
  const { data: mockWargame, loading } = useIndexedDBData<RGameState[]>('wargames')

  const effectiveGameProperties = useMemo(() => {
    if (xmppClient === undefined) {
      // ignore
    } else if (xmppClient === null) {
      if (!loading && mockWargame) {
        const state =  mockWargame[0]
        const { gameProperties } = splitGameState(state)
        // split the state into two parts
        return gameProperties
      }
    } else {
      return gamePropertiesDocument
    }
  }, [gamePropertiesDocument, xmppClient, loading, mockWargame])

  const name = useMemo(() => {
    return effectiveGameProperties?.name
  }, [effectiveGameProperties])

  const description = useMemo(() => {
    return effectiveGameProperties?.description
  }, [effectiveGameProperties])  

  const playerTheme = useMemo(() => {
    return effectiveGameProperties?.playerTheme
  }, [effectiveGameProperties])

  const adminTheme = useMemo(() => {
    return effectiveGameProperties?.adminTheme
  }, [effectiveGameProperties])

  return { playerTheme, adminTheme, name, description }
}