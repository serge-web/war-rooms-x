import React from 'react'
import RoomContent from '../RoomContent'
import './index.css'
import { useRoom } from '../useRoom'

const AdminRoom: React.FC = () => {
  const roomConfig = { roomName: '__admin' }
  const adminRoom = useRoom(roomConfig)

  return (
    <div className="admin-messages-container">
      <h3>Admin Messages</h3>
      <div className="admin-content">
        {adminRoom ? (
          <RoomContent room={roomConfig} />
        ) : (
          <p>No admin messages available</p>
        )}
      </div>
    </div>
  )
}

export default AdminRoom
