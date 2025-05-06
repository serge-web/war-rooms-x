import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import './index.css'
import { useRoom } from '../useRoom'
import { MapRoomConfig, RoomDetails, RoomType } from '../../../../types/rooms-d'
import { ConfigProvider, Button, Space, Tooltip } from 'antd'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { GeoJSON as LeafletGeoJSON } from 'leaflet'
import '@geoman-io/leaflet-geoman-free'

// Define types for Geoman functionality
interface GeomanControls {
  addControls: (options: Record<string, boolean | string>) => void
  removeControls: () => void
}

interface GeomanMap {
  pm: GeomanControls
}

// Define type for Layer with toGeoJSON method
interface GeoJSONLayer extends L.Layer {
  toGeoJSON(): GeoJSON.Feature
}


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
  }]
}

// Geoman Controls component to add drawing functionality to the map
const GeomanControls: React.FC = () => {
  const map = useMap()
  
  useEffect(() => {
    // Initialize Geoman controls
    const geomanMap = map as unknown as GeomanMap
    if (!geomanMap.pm) return
    
    geomanMap.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircleMarker: false,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
    })
    
    return () => {
      // Cleanup
      if (geomanMap.pm) {
        geomanMap.pm.removeControls()
      }
    }
  }, [map])
  
  return null
}

const MapContent: React.FC<MapProps> = ({ room }) => {
  const { theme, messages, sendMessage } = useRoom(room)
  const [currentFeatures, setCurrentFeatures] = useState<GeoJSON.GeoJSON | undefined>(undefined)
  const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null)

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
  
  // Update current features when messages change
  useEffect(() => {
    setCurrentFeatures(featureCollection)
  }, [featureCollection])
  
  // Function to capture the current map state and send as a message
  const captureAndSendMapState = useCallback(() => {
    if (!geoJsonLayerRef.current) return
    
    // Get the GeoJSON data from the map
    const layers = geoJsonLayerRef.current.getLayers()
    const features: GeoJSON.Feature[] = []
    
    layers.forEach(layer => {
      // Use type assertion to handle the GeoJSON layer
      const geoJSONLayer = layer as unknown as GeoJSONLayer
      if ('toGeoJSON' in geoJSONLayer) {
        const feature = geoJSONLayer.toGeoJSON()
        features.push(feature)
      }
    })
    
    // Create a GeoJSON FeatureCollection
    const newFeatureCollection: GeoJSON.GeoJSON = {
      type: 'FeatureCollection',
      features: features
    }
    
    // Send the updated map state as a message
    sendMessage('map', newFeatureCollection)
  }, [sendMessage])

  return (
    <ConfigProvider
    theme={theme}>
    <div className='map-content' data-testid={`map-content-${room.roomName}`}>
      <div className="map-content-container">
        <MapContainer 
          center={position} 
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
        >
          {mapConfig?.backdropUrl && <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={mapConfig?.backdropUrl}
          />}
          <GeoJSON 
            data={currentFeatures || mockFeatureCollection} 
            ref={geoJsonLayerRef}
          />
          <GeomanControls />
        </MapContainer>
        <div className="map-controls">
          <Space>
            <Tooltip title="Save the current map state">
              <Button type="primary" onClick={captureAndSendMapState}>Save Map State</Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
    </ConfigProvider>
  )
  
}

export default MapContent
