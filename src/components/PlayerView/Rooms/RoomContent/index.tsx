import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import ErrorModal from '../../../Utilities/ErrorModal'
import { useWargame } from '../../../../contexts/WargameContext'
import RoomPresenceBar from '../RoomPresenceBar'

interface RoomProps {
  room: RoomType
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, error, clearError, present, presenceVisibility } = useRoom(room)
  const { playerDetails } = useWargame()
  // const { users, presenceVisibility, loading } = useRoomUsers(room)
  console.log('room content', present)
  return (
    <ConfigProvider theme={theme}>
      <div className='room-content' data-testid={`room-content-${room.roomName}`}>
        <ErrorModal error={error} clearError={clearError} />
        
        {/* Room Presence Bar */}
        {present.length > 0 && (
          <RoomPresenceBar 
            userIds={present}
            visibilityConfig={presenceVisibility}
            currentUserForce={playerDetails?.forceId}
            isAdmin={playerDetails?.role === 'admin'}
          />
        )}
        
        <MessageList messages={messages} currentUser={playerDetails?.id || ''} templates={[]} />
        
        {canSubmit && (
          <MessageInputForm 
            onSendMessage={sendMessage} 
            disabled={false} 
          />
        )}
      </div>
    </ConfigProvider>
  )
}

export default RoomContent
