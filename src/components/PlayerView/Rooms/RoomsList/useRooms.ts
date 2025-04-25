import { useState, useEffect } from 'react'
import { RoomType } from '../../../../types/rooms-d';
import { useWargame } from '../../../../contexts/WargameContext';
import { useIndexedDBData } from '../../../../hooks/useIndexedDBData';
import { RRoom } from '../../../AdminView/raTypes-d';

export const useRooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { xmppClient, mockPlayerId } = useWargame()
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')

  // TODO - also handle details, extract from the room description

  useEffect(() => {
    if (xmppClient === undefined) {
      // waiting for login
    } else if (xmppClient === null) {
      if (!loading && mockPlayerId && mockRooms) {
        // ok, use mock data
        const myId = mockPlayerId.playerId
        const myForce = mockPlayerId.forceId
        const imAdmin = myId === 'admin'
        const isMyForce = (r: RRoom) => r.memberForces?.includes(myForce)
        const isMyId = (r: RRoom) => r.members?.includes(myId)
        const isAdminRoom = (r: RRoom) => r.id === '__admin'
        const myRooms = mockRooms.filter(r => imAdmin || isAdminRoom(r) || isMyForce(r) || isMyId(r))
        // filter rooms for those for my role/force
        setRooms(myRooms.map((room): RoomType => {
          return {
            roomName: room.id,
            naturalName: room.name,
          }
        }))
      } 
    } else {
      // TODO: use real data
      if (xmppClient.mucService) {
        const fetchRooms = async () => {
          const rooms = await xmppClient.listRooms()
          if (rooms) {
            setRooms(rooms.map((room): RoomType => {
              return {
                roomName: room.jid,
                naturalName: room.name,
              }
            }))
          }
        }
        fetchRooms()
      }
    }
  }, [xmppClient, mockRooms, loading, mockPlayerId]);

  return { rooms };
}