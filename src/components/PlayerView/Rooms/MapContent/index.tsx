import React, { useMemo } from 'react'
import './index.css'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import { usePlayerDetails } from '../../UserDetails/usePlayerDetails'

interface MapProps {
  room: RoomType
}

const MapContent: React.FC<MapProps> = ({ room }) => {
  const { messages, theme } = useRoom(room)
  const { playerDetails } = usePlayerDetails()
  const lastMessage = useMemo(() => {
    return messages[messages.length - 1]
  }, [messages])
  if (!lastMessage) {
    return (
      <ConfigProvider
      theme={theme}>
      <div className='map-content' data-testid={`map-content-${room.roomName}`}>
        PENDING MAP
      </div>
      </ConfigProvider>
    )
  }
  return (
    <ConfigProvider
    theme={theme}>
    <div className='map-content' data-testid={`map-content-${room.roomName}`}>
      MAP SHOWN HERE
      <MessageList messages={[lastMessage]} currentUser={playerDetails?.id || ''} />
    </div>
    </ConfigProvider>
  )
  
}

export default MapContent
