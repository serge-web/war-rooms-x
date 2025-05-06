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

const mockFeatureCollection: GeoJSON.GeoJSON = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-0.29, 51.505]
    },
    properties: {
      name: 'Test Point'
    }
  }
]}

const MapContent: React.FC<MapProps> = ({ room }) => {
  const { theme, messages } = useRoom(room)

  const config: RoomDetails | undefined = useMemo(() => {
    if (!room.description) 
      return undefined
    try {
      const data = JSON.parse(room.description)
      return data
    } catch (error) {
      console.error("Failed to parse room.description:", error)
      return undefined
    }
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
        <GeoJSON data={featureCollection || mockFeatureCollection} />

      </MapContainer>
    </div>
    </ConfigProvider>
  )
  
}

export default MapContent
