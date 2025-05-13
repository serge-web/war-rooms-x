import { useState, useEffect } from 'react'
import { RoomType } from '../types/rooms-d';
import { useIndexedDBData } from './useIndexedDBData';
import { RRoom } from '../components/AdminView/raTypes-d';
import { XMPPService } from '../services/xmpp';
import { MockId } from '../types/wargame-d';

export const useRooms = (xmppClient: XMPPService | null | undefined, mockPlayerId: MockId | null) => {
  const [rooms, setRooms] = useState<RoomType[]>([])  
  const { data: mockRooms, loading } = useIndexedDBData<RRoom[]>('chatrooms')

  useEffect(() => {
    console.log('update rooms', xmppClient, mockRooms, loading, mockPlayerId)
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
        setRooms(myRooms.map((room: RRoom): RoomType => {
          return {
            roomName: room.id,
            naturalName: room.name,
            description: JSON.stringify(room.details)
          }
        }))
      } 
    } else {
      // TODO: use real data
      if (xmppClient.mucServiceUrl) {
        const fetchRooms = async () => {
          const rooms = await xmppClient.listRooms()
          // get the room description
          const getInfoActions = rooms.map((room) => {
            return xmppClient.client?.getDiscoInfo(room.jid)
          })
          const infos = await Promise.all(getInfoActions)
          if (rooms) {
            setRooms(rooms.map((room, i): RoomType => {
              const info = infos[i]?.extensions[0].fields?.find((f) => f.name === 'muc#roominfo_description')
              return {
                roomName: room.jid,
                naturalName: room.name,
                description: info?.value as string || ''
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