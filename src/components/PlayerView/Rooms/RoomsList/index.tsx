import React, { useMemo } from 'react'
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import RoomContent from '../RoomContent'
import './index.css'
import { RoomType } from '../../../../types/wargame'
import { useWargame } from '../../../../contexts/WargameContext'

const RoomsList: React.FC = () => {
  const { rooms } = useWargame()
  // Create a FlexLayout model for the rooms
  const model = useMemo((): FlexLayout.Model => {
    const jsonModel: FlexLayout.IJsonModel = {
      global: {},
      borders: [],
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: rooms.filter((room: RoomType) => !room.roomName.startsWith('__')).map(room => ({
              type: 'tab',
              name: room.naturalName,
              component: 'room',
              config: room
            }))
          }
        ]
      }
    }
    return FlexLayout.Model.fromJson(jsonModel)
  }, [rooms])

  console.log('rooms', rooms, model)

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
