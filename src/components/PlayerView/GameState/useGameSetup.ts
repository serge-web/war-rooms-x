import { useMemo } from 'react'
import { GamePropertiesType } from '../../../types/wargame-d'
import { usePubSub } from '../../../hooks/usePubSub'
import { splitGameState } from '../../../helpers/split-game-state'
import { useIndexedDBData } from '../../../hooks/useIndexedDBData'
import { RGameState } from '../../AdminView/raTypes-d'
import { XMPPService } from '../../../services/XMPPService'

export const useGameProperties = (xmppClient: XMPPService | null | undefined) => {
  const { document: gamePropertiesDocument } = usePubSub<GamePropertiesType>('game-setup', xmppClient)
  const { data: mockWargame, loading } = useIndexedDBData<RGameState[]>('wargames')

  const gameProperties: GamePropertiesType | null = useMemo(() => {
    if (xmppClient === undefined) {
      // ignore
      return null
    } else if (xmppClient === null) {
      if (!loading && mockWargame) {
        const state =  mockWargame[0]
        const { gameProperties: gamePropertiesPub } = splitGameState(state)
        return gamePropertiesPub
      }
      return null
    } else {
      return gamePropertiesDocument
    }
  }, [gamePropertiesDocument, xmppClient, loading, mockWargame])

  const name = useMemo(() => {
    return gameProperties?.name
  }, [gameProperties])

  const description = useMemo(() => {
    return gameProperties?.description
  }, [gameProperties])  

  const playerTheme = useMemo(() => {
    return gameProperties?.playerTheme
  }, [gameProperties])

  const adminTheme = useMemo(() => {
    return gameProperties?.adminTheme
  }, [gameProperties])

  return { playerTheme, adminTheme, name, description, gameProperties }
}