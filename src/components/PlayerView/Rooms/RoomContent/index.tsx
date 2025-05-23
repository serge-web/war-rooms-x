import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import InfoModal from '../../../Utilities/InfoModal'
import { useWargame } from '../../../../contexts/WargameContext'
import RoomPresenceBar from '../RoomPresenceBar'

interface RoomProps {
  room: RoomType
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, infoModal, setInfoModal, users, presenceVisibility } = useRoom(room)
  const { playerDetails } = useWargame()
  
  // Handle message editing for both chat and form messages
  const handleEditMessage = (messageId: string, newContent: string | object) => {
    console.log(`Editing message ${messageId} with new content:`, newContent)
    // TODO: Implement actual message editing logic
    // The actual implementation will need to handle both string (for chat) and object (for forms) content
  }
  return (
    <ConfigProvider theme={theme}>
      <div className='room-content' data-testid={`room-content-${room.roomName}`}>
        <InfoModal info={infoModal} clearModal={() => setInfoModal(null)} />
        
        {/* Room Presence Bar */}
        {users.length > 0 && (
          <RoomPresenceBar 
            users={users}
            visibilityConfig={presenceVisibility}
            currentUserForce={playerDetails?.forceId}
            isAdmin={playerDetails?.role === 'admin'}
          />
        )}
        
        <MessageList 
          messages={messages} 
          currentUser={playerDetails?.id || ''} 
          templates={[]}
          onEditMessage={handleEditMessage}
        />
        
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
