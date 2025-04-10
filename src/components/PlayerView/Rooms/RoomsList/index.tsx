import React, { useMemo } from 'react'
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import RoomContent from '../RoomContent'
import './index.css'
import { useRooms } from './useRooms'
import { RoomType } from '../../../../types/rooms'

const specialRoom = (room: RoomType): boolean => {
  return room.roomName.startsWith('__')
}

const RoomsList: React.FC = () => {
  const { rooms } = useRooms()
  // Create a FlexLayout model for the rooms
  const model = useMemo((): FlexLayout.Model => {
    const normalRooms = rooms.filter((room: RoomType) => !specialRoom(room))
    const convertedRooms = normalRooms.map(room => ({
      type: 'tab',
      name: room.naturalName,
      component: 'room',
      config: room
    }))
    const first = convertedRooms[0]
    const afterFirst = convertedRooms.slice(1)
    const jsonModel: FlexLayout.IJsonModel = {
      global: { tabEnableClose: false, tabEnablePopout: true },
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: [first]
          }
        ]
      }
    }
    if (afterFirst.length > 0) {
      jsonModel.layout.children.push({
        type: 'tabset',
        weight: 50,
        children: afterFirst
      })
    }
    return FlexLayout.Model.fromJson(jsonModel)
  }, [rooms])

  // Factory function to render components based on type
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    const room = node.getConfig() as RoomType
    
    if (component === 'room') {
        return <RoomContent room={room} />
    }
    
    return <div>Component not found</div>
  }

  return (
    <div className="rooms-list-container flex-layout-container">
      <FlexLayout.Layout 
        model={model} 
        factory={factory}
      />
    </div>
  )
}

export default RoomsList
