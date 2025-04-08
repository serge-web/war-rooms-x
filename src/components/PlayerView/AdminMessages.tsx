import React from 'react'
import { mockRooms } from '../../rooms-test/__mocks__/mockRooms'
import RoomContent from './RoomContent'
import './AdminMessages.css'

const AdminMessages: React.FC = () => {
  // Find the admin room from mockRooms
  const adminRoom = mockRooms.find(room => room.id === '__admin')

  return (
    <div className="admin-messages-container">
      <h3>Admin Messages</h3>
      <div className="admin-content">
        {adminRoom ? (
          <RoomContent room={adminRoom} />
        ) : (
          <p>No admin messages available</p>
        )}
      </div>
    </div>
  )
}

export default AdminMessages
