import React from 'react'
import RoomContent from '../RoomContent'
import './index.css'
import { RoomType } from '../../../../types/rooms'
import { useRooms } from '../RoomsList/useRooms'
import { useEffect, useState } from 'react'

const AdminRoom: React.FC = () => {
  const { rooms } = useRooms()
  const [room, setRoom] = useState<RoomType | null>(null)

  useEffect(() => {
    const adminRoom = rooms.find((r: RoomType) => r.roomName.startsWith('__admin'))
    if (adminRoom) {
      setRoom(adminRoom)
    }
  }, [rooms])

  return (
    <div className="admin-messages-container">
      <h3>Admin Messages</h3>
      <div className="admin-content">
        {room ? (
          <RoomContent room={room} />
        ) : (
          <p>No admin messages available</p>
        )}
      </div>
    </div>
  )
}

export default AdminRoom
