import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType, UserError } from '../../../../types/rooms'
import { ConfigProvider, Modal } from 'antd'

interface RoomProps {
  room: RoomType
}

const ErrorModal: React.FC<{error: UserError | null, clearError: () => void}> = ({error, clearError}) => {
  return (
    <Modal open={!!error} title={error?.title  } onOk={clearError} onCancel={clearError}>
      <p>{error?.message}</p>
    </Modal>
  )
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, theme, canSubmit, sendMessage, error, clearError } = useRoom(room)
  console.log('error', error)
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
