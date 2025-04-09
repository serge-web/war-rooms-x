import React, { useState } from 'react'
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { mockRooms } from '../../../rooms-test/__mocks__/mockRooms'
import RoomContent, { Room } from '../RoomContent'
import './index.css'

const RoomsList: React.FC = () => {
  // Create a FlexLayout model for the rooms
  const createModel = (): FlexLayout.Model => {
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
            children: mockRooms.filter((room: Room) => !room.id.startsWith('__')).map(room => ({
              type: 'tab',
              name: room.name,
              component: 'room',
              config: { roomId: room.id }
            }))
          }
        ]
      }
    }
    return FlexLayout.Model.fromJson(jsonModel)
  }

  const [model] = useState<FlexLayout.Model>(createModel())

  // Factory function to render components based on type
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    const config = node.getConfig()
    
    if (component === 'room') {
      const roomId = config.roomId
      const room = mockRooms.find(r => r.id === roomId)
      
      if (room) {
        return <RoomContent room={room} />
      }
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
