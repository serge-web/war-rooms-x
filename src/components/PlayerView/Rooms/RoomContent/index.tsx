import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms'
import { ConfigProvider } from 'antd'
import ErrorModal from '../../../Utilities/ErrorModal'

interface RoomProps {
  room: RoomType
}



const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, users, theme, canSubmit, sendMessage, error, clearError } = useRoom(room)
  console.log('users', room.naturalName, users)
  return (
    <ConfigProvider
    theme={theme}>
    <div className='room-content' data-testid={`room-content-${room.roomName}`}>
      <ErrorModal error={error} clearError={clearError} />
      <MessageList messages={messages} />
      { canSubmit && <MessageInputForm 
        onSendMessage={sendMessage} 
        disabled={false} 
      />}
    </div>
    </ConfigProvider>
  )
  
}

export default RoomContent
