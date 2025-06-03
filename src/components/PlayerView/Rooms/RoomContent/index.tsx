import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType, GameMessage, PresenceVisibility, type UserInfo, type OnlineUser, type MessageDetails } from '../../../../types/rooms-d'
import { ConfigProvider, type ThemeConfig } from 'antd'
import InfoModal from '../../../Utilities/InfoModal'
import { useWargame } from '../../../../contexts/WargameContext'
import RoomPresenceBar from '../RoomPresenceBar'
import { ForceConfigType } from '../../../../types/wargame-d'

export interface RoomContentCoreProps {
  room: RoomType
  messages: GameMessage[]
  theme: ThemeConfig | undefined
  canSubmit: boolean
  sendMessage: (messageType: MessageDetails['messageType'], content: object) => void
  infoModal: UserInfo | null
  setInfoModal: (modal: UserInfo | null) => void
  users: OnlineUser[]
  presenceVisibility: PresenceVisibility
  currentUserForceId?: string
  currentUserId?: string
  isAdmin?: boolean
  getForce: (forceId: string) => Promise<ForceConfigType>
}

// The core component that accepts props directly
const RoomContentCore: React.FC<RoomContentCoreProps> = ({
  room,
  messages,
  theme,
  canSubmit,
  sendMessage,
  infoModal,
  setInfoModal,
  users,
  presenceVisibility,
  currentUserForceId,
  currentUserId = '',
  isAdmin = false,
  getForce
}) => {

  return (
    <ConfigProvider theme={theme}>
      <div className='room-content' data-testid={`room-content-${room.roomName}`}>
        <InfoModal info={infoModal} clearModal={() => setInfoModal(null)} />
        
        {/* Room Presence Bar */}
        {users.length > 0 && (
          <RoomPresenceBar 
            users={users}
            visibilityConfig={presenceVisibility}
            currentUserForce={currentUserForceId}
            isAdmin={isAdmin}
            getForce={getForce}
          />
        )}
        
        <MessageList messages={messages} currentUser={currentUserId} templates={[]} getForce={getForce} />
        
        {canSubmit && (
          <MessageInputForm 
            onSendMessage={(messageType: MessageDetails['messageType'], content: object) => sendMessage(messageType, content)} 
            disabled={false} 
          />
        )}
      </div>
    </ConfigProvider>
  )
}

// Create a backward-compatible wrapper that uses the useRoom hook
const RoomContent: React.FC<{room: RoomType}> = ({ room }) => {
  const { 
    messages, 
    theme, 
    canSubmit, 
    sendMessage, 
    infoModal, 
    setInfoModal, 
    users, 
    presenceVisibility
  } = useRoom(room)

  const { getForce } = useWargame()
  
  const { playerDetails } = useWargame()
  
  return (
    <RoomContentCore
      room={room}
      messages={messages}
      theme={theme}
      canSubmit={canSubmit}
      sendMessage={sendMessage}
      infoModal={infoModal}
      setInfoModal={setInfoModal}
      users={users}
      presenceVisibility={presenceVisibility}
      currentUserForceId={playerDetails?.forceId}
      currentUserId={playerDetails?.id}
      isAdmin={playerDetails?.role === 'admin'}
      getForce={getForce}
    />
  )
}

// For compatibility with existing code, export the wrapper as default
export default RoomContent

// Also export the core component for direct use in tests/stories
export { RoomContentCore }
