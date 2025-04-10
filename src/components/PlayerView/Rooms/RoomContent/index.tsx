import React from 'react'
import './index.css'
import MessageInputForm from '../Messages/MessageInputForm'
import MessageList from '../Messages/MessageList'
import { useRoom } from '../useRoom'
import { RoomType } from '../../../../types/rooms'
import { ConfigProvider } from 'antd'

interface RoomProps {
  room: RoomType
}

const RoomContent: React.FC<RoomProps> = ({ room }) => {
  const { messages, theme, canSubmit } = useRoom(room)
  console.log('theme', theme)
  return (
    <ConfigProvider
    theme={theme}>
    <div className='room-content' data-testid={`room-content-${room.roomName}`}>
      <MessageList messages={messages} />
      { canSubmit && <MessageInputForm 
        onSendMessage={(content) => console.log('Message sent:', content)} 
        disabled={false} 
      />}
    </div>
    </ConfigProvider>
  )
  
}

export default RoomContent
