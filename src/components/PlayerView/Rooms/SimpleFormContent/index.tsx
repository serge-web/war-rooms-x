import React, { useMemo } from 'react'
import './index.css'
import FormMessageBuilder from './FormMessageBuilder'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType, Template } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import InfoModal from '../../../Utilities/InfoModal'
import { useTemplates } from '../../../../hooks/useTemplates'
import { useWargame } from '../../../../contexts/WargameContext'
import RoomPresenceBar from '../RoomPresenceBar'

interface SimpleFormProps {
  room: RoomType
}

const SimpleFormContent: React.FC<SimpleFormProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, infoModal, setInfoModal, users, presenceVisibility } = useRoom(room)
  const { playerDetails } = useWargame()
  const { templates } = useTemplates()
  // const { users, presenceVisibility, loading } = useRoomUsers(room)
  const myTemplates = useMemo(() => {
    if (!room.description)
      return undefined
    const config = JSON.parse(room.description)
    if (!config.specifics?.templateIds)
      return undefined
    return config.specifics.templateIds.map((id: string) => {
      return templates.find(t => t.id === id)
    }).filter((t: Template | undefined): boolean => t !== undefined)
  }, [room, templates])
  if (!myTemplates || myTemplates.length === 0) {
    return null
  }
  return (
    <ConfigProvider
    theme={theme}>
    <div className='simple-form-content' data-testid={`simple-form-content-${room.roomName}`}>
      <InfoModal info={infoModal} clearModal={() => setInfoModal(null)} />
      
      {/* Room Presence Bar */}
      <RoomPresenceBar 
          users={users}
          visibilityConfig={presenceVisibility}
          currentUserForce={playerDetails?.forceId}
          isAdmin={playerDetails?.role === 'admin'}
        />
      
      <MessageList messages={messages} currentUser={playerDetails?.id || ''} templates={templates || []} />
      { canSubmit && myTemplates && <FormMessageBuilder 
        onSendMessage={sendMessage} 
        disabled={false} 
        templates={myTemplates}
      />}
    </div>
    </ConfigProvider>
  )
  
}

export default SimpleFormContent
