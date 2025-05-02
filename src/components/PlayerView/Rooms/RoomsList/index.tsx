import React, { useMemo } from 'react'
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import RoomContent from '../RoomContent'
import './index.css'
import { useRooms } from './useRooms'
import { RoomType } from '../../../../types/rooms-d'
import { Typography } from 'antd'
import MapContent from '../MapContent'
import SimpleFormContent from '../SimpleFormContent'

const { Text } = Typography

const specialRoom = (room: RoomType): boolean => {
  return room.roomName.startsWith('__')
}

const RoomsList: React.FC = () => {
  const { rooms } = useRooms()
  
  // Create a FlexLayout model for the rooms
  const model = useMemo((): FlexLayout.Model => {
    const normalRooms = rooms.filter((room: RoomType) => !specialRoom(room))
    const convertedRooms = normalRooms.map(room => {
      const details = JSON.parse(room.description || '{}')
      return {
      type: 'tab',
      name: room.naturalName,
      component: details.specifics?.roomType || 'room',
      config: room
    }})
    // split convertedRooms into two equally sized lists
    const midPoint = Math.ceil(convertedRooms.length / 2)
    const leftChildren = convertedRooms.slice(0, midPoint)
    const rightChildren = convertedRooms.slice(midPoint)

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
            children: leftChildren
          },
          {
            type: 'tabset',
            weight: 50,
            children: rightChildren
          }
        ]
      }
    }
    return FlexLayout.Model.fromJson(jsonModel)
  }, [rooms])

  // Factory function to render components based on type
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent()
    const room = node.getConfig() as RoomType
    switch (component) {
    case 'chat': 
    return <RoomContent room={room} />  
    case 'map':
    return <MapContent room={room} />
    case 'form':
    return <SimpleFormContent room={room} />
    default:
      return <div>Component not found:{component}</div>
  }
  }

  // Custom tab renderer to use Ant Design Text component
  const onRenderTab = (node: FlexLayout.TabNode, renderValues: FlexLayout.ITabRenderValues) => {
    renderValues.content = (
      <Text style={{ padding: '0 5px' }}>
        {node.getName()}
      </Text>
    )
    return null
  }

  return (
    <div className="rooms-list-container flex-layout-container">
      <FlexLayout.Layout 
        model={model} 
        factory={factory}
        onRenderTab={onRenderTab}
      />
    </div>
  )
}

export default RoomsList
