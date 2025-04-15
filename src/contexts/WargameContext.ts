import { createContext } from 'react'
import { WargameContextType } from '../types/wargame-d'
import { useContext } from 'react'

export const WargameContext = createContext<WargameContextType | undefined>(undefined)

export const useWargame = () => {
  const context = useContext(WargameContext)
  if (!context) {
    throw new Error('useWargame must be used within a WargameProvider')
  }
  return context
}