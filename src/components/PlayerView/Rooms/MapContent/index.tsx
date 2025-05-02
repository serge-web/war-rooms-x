import React, { useMemo } from 'react'
import './index.css'
import { useRoom } from '../useRoom'
import { MapRoomConfig, RoomDetails, RoomType } from '../../../../types/rooms-d'
import { ConfigProvider } from 'antd'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'


interface MapProps {
  room: RoomType
}

const MapContent: React.FC<MapProps> = ({ room }) => {
  const { theme, messages } = useRoom(room)

  const config: RoomDetails | undefined = useMemo(() => {
    if (!room.description) 
      return undefined
    const data= JSON.parse(room.description)
    console.log('parsed data', data)
    return data
  }, [room])
  
  const mapConfig: MapRoomConfig | undefined = useMemo(() => {
    if (!config) 
      return undefined
    if (config.specifics?.roomType !== 'map') 
      return undefined
    return config.specifics
  }, [config])

  // Default position - can be updated based on your requirements
  const position: [number, number] = [51.505, -0.09]
  
  const featureCollection: GeoJSON.GeoJSON | undefined = useMemo(() => {
    if (messages.length > 0) {
      return messages[messages.length - 1].content as GeoJSON.GeoJSON
    } else {
      return undefined
    }
  }, [messages])

  if (!featureCollection) {
    return (
      <ConfigProvider
      theme={theme}>
      <div className='map-content' data-testid={`map-content-${room.roomName}`}>
        PENDING MAP
      </div>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider
    theme={theme}>
    <div className='map-content' data-testid={`map-content-${room.roomName}`}>
      <MapContainer 
        center={position} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
      >
        {mapConfig?.backdropUrl && <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapConfig?.backdropUrl}
        />}
        <GeoJSON data={featureCollection} />

      </MapContainer>
    </div>
    </ConfigProvider>
  )
  
}

export default MapContent
