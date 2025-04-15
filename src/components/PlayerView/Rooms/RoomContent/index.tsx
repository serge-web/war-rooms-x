import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import ErrorModal from '../../../Utilities/ErrorModal'
import { usePlayerDetails } from '../../UserDetails/usePlayerDetails'

interface RoomProps {
  room: RoomType
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, error, clearError } = useRoom(room)
  const { playerDetails } = usePlayerDetails()
  return (
    <ConfigProvider
    theme={theme}>
    <div className='room-content' data-testid={`room-content-${room.roomName}`}>
      <ErrorModal error={error} clearError={clearError} />
      <MessageList messages={messages} currentUser={playerDetails?.id || ''} />
      { canSubmit && <MessageInputForm 
        onSendMessage={sendMessage} 
        disabled={false} 
      />}
    </div>
    </ConfigProvider>
  )
  
}

export default RoomContent
