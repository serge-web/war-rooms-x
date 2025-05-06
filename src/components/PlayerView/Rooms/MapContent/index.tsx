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

// Define types for Geoman functionality
interface GeomanControls {
  addControls: (options: Record<string, boolean | string>) => void
  removeControls: () => void
  setGlobalOptions: (options: Record<string, unknown>) => void
}

interface GeomanMap {
  pm: GeomanControls
}

// Define type for Geoman layer
type GeomanLayer = L.Layer & {
  remove: () => void
  toGeoJSON: () => GeoJSON.Feature
  pm: Record<string, unknown>
}

// Define type for Geoman create event
type GeomanCreateEvent = L.LeafletEvent & {
  layer: GeomanLayer
  shape: string
  layerType: string
}

// Geoman Controls component to add drawing functionality to the map
const GeomanControls: React.FC<{ 
  onMapModified: () => void, 
  mapRef: React.RefObject<L.Map | null>,
  geoJsonLayerRef: React.RefObject<LeafletGeoJSON | null>
}> = ({ onMapModified, mapRef, geoJsonLayerRef }) => {
  const map = useMap()
  
  // Store the map reference for use in the parent component
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map
    }
  }, [map, mapRef])
  
  useEffect(() => {
    // Initialize Geoman controls
    const geomanMap = map as unknown as GeomanMap
    if (!geomanMap.pm) return
    
    // Configure Geoman
    geomanMap.pm.setGlobalOptions({
      // Add features to our GeoJSON layer instead of creating new layers
      layerGroup: geoJsonLayerRef.current as unknown as L.LayerGroup,
      // Ensure features are added to our layer
      syncLayersOnEdit: true,
      syncLayersOnDrag: true
    })
    
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
    
    // Handle the pm:create event to ensure features are added to our layer
    const handleCreate = (e: L.LeafletEvent) => {
      const geomanEvent = e as GeomanCreateEvent
      const layer = geomanEvent.layer
      
      // Remove the layer from the map as Geoman adds it directly
      layer.remove()
      
      // Add the feature to our GeoJSON layer
      if (geoJsonLayerRef.current) {
        try {
          const feature = layer.toGeoJSON()
          const currentData = geoJsonLayerRef.current.toGeoJSON()

          // Add the new feature to our GeoJSON data
          if (currentData.type === 'FeatureCollection') {
            currentData.features.push(feature)
            
            // Update the GeoJSON layer with the new data
            geoJsonLayerRef.current.clearLayers()
            geoJsonLayerRef.current.addData(currentData)
          }
        } catch (error) {
          console.error('Error adding feature to GeoJSON layer:', error)
        }
      }
      
      // Notify that the map has been modified
      onMapModified()
    }
    
    // Add event listeners for map modifications
    map.on('pm:create', handleCreate)
    map.on('pm:remove', onMapModified)
    map.on('pm:edit', onMapModified)
    map.on('pm:dragend', onMapModified)
    map.on('pm:cut', onMapModified)
    
    return () => {
      // Cleanup
      if (geomanMap.pm) {
        geomanMap.pm.removeControls()
      }
      
      // Remove event listeners
      map.off('pm:create', handleCreate)
      map.off('pm:remove', onMapModified)
      map.off('pm:edit', onMapModified)
      map.off('pm:dragend', onMapModified)
      map.off('pm:cut', onMapModified)
    }
  }, [map, onMapModified, geoJsonLayerRef])
  
  return null
}

const MapContent: React.FC<MapProps> = ({ room }) => {
  const { theme, messages, sendMessage } = useRoom(room)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const geoJsonLayerRef = useRef<LeafletGeoJSON | null>(null)
  const mapRef = useRef<L.Map | null>(null)

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

  const latestMessage = useMemo(() => {
    if (messages.length > 0) {
      return messages[messages.length - 1]
    } else {
      return undefined
    }
  }, [messages])
  
  const currentFeatures: GeoJSON.GeoJSON | undefined = useMemo(() => {
    if (latestMessage) {
      const latest = latestMessage.content as GeoJSON.GeoJSON
      return latest
    } else {
      return undefined
    }
  }, [latestMessage])
  
  
  // Function to handle map modifications
  const handleMapModified = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // Function to capture the current map state and send as a message
  const captureAndSendMapState = useCallback(() => {
    if (!mapRef.current) return
    
    const features: GeoJSON.Feature[] = []
    
    // Get all layers from the map, including Geoman-created layers
    mapRef.current.eachLayer((layer) => {
      // Use type assertion to handle the GeoJSON layer
      const geoJSONLayer = layer as unknown as GeoJSONLayer
      
      // Check if this layer has the toGeoJSON method (is a feature layer)
      if (layer && 'toGeoJSON' in layer) {
        try {
          const feature = geoJSONLayer.toGeoJSON()
          // Skip the base tile layer which might also have toGeoJSON
          if (feature.type === 'Feature') {
            features.push(feature)
          }
        } catch (e) {
          console.error('Error converting layer to GeoJSON', e)
        }
      }
    })
    
    // Create a GeoJSON FeatureCollection
    const newFeatureCollection: GeoJSON.GeoJSON = {
      type: 'FeatureCollection',
      features: features
    }
    
    // Send the updated map state as a message
    sendMessage('map', newFeatureCollection)
    
    // Reset the unsaved changes flag
    setHasUnsavedChanges(false)
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
          { currentFeatures && <GeoJSON 
            key={latestMessage?.id}
            data={currentFeatures} 
            ref={geoJsonLayerRef}
          /> }
          <GeomanControls 
            onMapModified={handleMapModified} 
            mapRef={mapRef} 
            geoJsonLayerRef={geoJsonLayerRef}
          />
        </MapContainer>
        <div className="map-controls">
          <Space>
            <Tooltip title={hasUnsavedChanges ? 'Save the current map state' : 'No unsaved changes'}>
              <Button 
                type="primary" 
                onClick={captureAndSendMapState} 
                disabled={!hasUnsavedChanges}
              >
                Save Map State
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
    </ConfigProvider>
  )
  
}

export default MapContent
