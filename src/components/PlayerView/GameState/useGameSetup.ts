import { useMemo } from 'react'
import { GamePropertiesType } from '../../../types/wargame-d'
import { usePubSub } from '../../../hooks/usePubSub'

export const useGameProperties = () => {
  const { document: gameProperties } = usePubSub<GamePropertiesType>('game-setup')

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

  return { playerTheme, adminTheme, name, description }
}