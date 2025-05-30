import React, { useMemo } from 'react'
import './index.css'
import FormMessageBuilder from './FormMessageBuilder'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType, Template, GameMessage, UserInfo, OnlineUser, PresenceVisibility, MessageDetails } from '../../../../types/rooms-d'
import { ConfigProvider, Empty, type ThemeConfig } from 'antd'
import InfoModal from '../../../Utilities/InfoModal'
import { useTemplates } from '../../../../hooks/useTemplates'
import { useWargame } from '../../../../contexts/WargameContext'
import RoomPresenceBar from '../RoomPresenceBar'
import { ForceConfigType } from '../../../../types/wargame-d'

export interface SimpleFormCoreProps {
  room: RoomType
  messages: GameMessage[]
  theme: ThemeConfig | undefined
  canSubmit: boolean
  sendMessage: (messageType: MessageDetails['messageType'], content: object) => void
  infoModal: UserInfo | null
  setInfoModal: (modal: UserInfo | null) => void
  users: OnlineUser[]
  presenceVisibility: PresenceVisibility
  playerDetails: {
    id?: string
    forceId?: string
    role?: string
  } | null
  templates: Template[]
  getForce: (forceId: string) => Promise<ForceConfigType>
}

interface SimpleFormProps {
  room: RoomType
}

// Core component that accepts all props directly (no hooks)
export const SimpleFormContentCore: React.FC<SimpleFormCoreProps> = ({
  room,
  messages,
  theme,
  canSubmit,
  sendMessage,
  infoModal,
  setInfoModal,
  users,
  presenceVisibility,
  playerDetails,
  templates,
  getForce
}) => {
  const myTemplates = useMemo(() => {
    if (!room.description) return []
    try {
      const config = JSON.parse(room.description)
      if (!config.specifics?.templateIds) return []
      return config.specifics.templateIds
        .map((id: string) => templates.find(t => t.id === id))
        .filter((t: Template | undefined): t is Template => t !== undefined)
    } catch (e) {
      console.error('Error parsing room description:', e)
      return []
    }
  }, [room.description, templates])

  if (myTemplates.length === 0) {
    return <Empty description="Warning: no templates configured for this room" />
  }

  return (
    <ConfigProvider theme={theme}>
      <div className='simple-form-content' data-testid={`simple-form-content-${room.roomName}`}>
        <InfoModal info={infoModal} clearModal={() => setInfoModal(null)} />
        
        {/* Room Presence Bar */}
        <RoomPresenceBar 
          users={users}
          visibilityConfig={presenceVisibility}
          currentUserForce={playerDetails?.forceId}
          isAdmin={playerDetails?.role === 'admin'}
          getForce={getForce}
        />
        
        <MessageList 
          messages={messages} 
          getForce={getForce} 
          currentUser={playerDetails?.id || ''} 
          templates={templates} 
        />
        
        {canSubmit && myTemplates.length > 0 && (
          <FormMessageBuilder 
            onSendMessage={sendMessage} 
            disabled={false} 
            templates={myTemplates}
          />
        )}
      </div>
    </ConfigProvider>
  )
}

// Default export that uses hooks and passes data to the core component
const SimpleFormContent: React.FC<SimpleFormProps> = ({ room }) => {
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
  
  const { playerDetails, getForce } = useWargame()
  const { templates = [] } = useTemplates()

  return (
    <SimpleFormContentCore
      room={room}
      messages={messages}
      theme={theme}
      canSubmit={canSubmit}
      sendMessage={sendMessage}
      infoModal={infoModal}
      setInfoModal={setInfoModal}
      users={users}
      presenceVisibility={presenceVisibility}
      playerDetails={playerDetails}
      templates={templates}
      getForce={getForce}
    />
  )
}

export default SimpleFormContent
