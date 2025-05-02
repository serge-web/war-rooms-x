import React, { useMemo } from 'react'
import './index.css'
import FormMessageBuilder from '../Messages/FormMessageBuilder'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import ErrorModal from '../../../Utilities/ErrorModal'
import { usePlayerDetails } from '../../UserDetails/usePlayerDetails'
import { useTemplates } from '../../../../hooks/useTemplates'

interface SimpleFormProps {
  room: RoomType
}

const SimpleFormContent: React.FC<SimpleFormProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, error, clearError } = useRoom(room)
  const { playerDetails } = usePlayerDetails()
  const { templates } = useTemplates()
  const myTemplates = useMemo(() => {
    if (!room.description)
      return undefined
    const config = JSON.parse(room.description)
    if (!config.specifics?.templateIds)
      return undefined
    return config.specifics.templateIds.map((id: string) => {
      return templates.find(t => t.id === id)
    })
  }, [room, templates])
  console.log('my templates', myTemplates)
  return (
    <ConfigProvider
    theme={theme}>
    <div className='map-content' data-testid={`room-content-${room.roomName}`}>
      SIMPLE FORM SHOWN HERE
      <ErrorModal error={error} clearError={clearError} />
      <MessageList messages={messages} currentUser={playerDetails?.id || ''} />
      { canSubmit && <FormMessageBuilder 
        onSendMessage={sendMessage} 
        disabled={false} 
        templates={myTemplates}
      />}
    </div>
    </ConfigProvider>
  )
  
}

export default SimpleFormContent
