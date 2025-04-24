import { useEffect, useState } from 'react'
import { GamePropertiesType } from '../../../types/wargame-d'
import { usePubSub } from '../../../hooks/usePubSub'
import { ThemeConfig } from 'antd'

export const useGameProperties = () => {
  const { document: gameProperties } = usePubSub<GamePropertiesType>('game-setup')
  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [playerTheme, setPlayerTheme] = useState<ThemeConfig | undefined>(undefined)
  const [adminTheme, setAdminTheme] = useState<ThemeConfig | undefined>(undefined)

  useEffect(() => {
    if (gameProperties) {
      setName(gameProperties.name)
      setDescription(gameProperties.description)
      setPlayerTheme(gameProperties.playerTheme)
      setAdminTheme(gameProperties.adminTheme)
    }
  }, [gameProperties])
  

  return { playerTheme, adminTheme, name, description }
}