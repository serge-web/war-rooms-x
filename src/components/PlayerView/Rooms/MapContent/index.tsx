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
  feature?: GeoJSON.Feature
  options?: Record<string, unknown>
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
    
    // Configure Geoman - don't use layerGroup to allow individual layer manipulation
    geomanMap.pm.setGlobalOptions({
      // Keep each feature as a separate layer for individual editing
      syncLayersOnEdit: false,
      syncLayersOnDrag: false
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
    
    // Handle the pm:create event to track map modifications
    const handleCreate = (e: L.LeafletEvent) => {
      // Mark the layer as a Geoman-created layer to identify it when saving
      const geomanEvent = e as GeomanCreateEvent
      const layer = geomanEvent.layer

      // if it's a circle, we need to copy `radius` to teh properties
      if (layer.options && layer.options.radius) {
        layer.feature.properties.radius = layer.options.radius
      }

      // if it's a text marker, copy the label to properties
      if (layer.options && layer.options.text) {
        layer.feature.properties.text = layer.options.text
      }
      
      // Store the original feature for identification
      try {
        // Add a property to identify this as a Geoman-created layer
        layer.feature = layer.toGeoJSON()
        if (layer.feature.properties) {
          layer.feature.properties.geomanCreated = true
          layer.feature.properties.id = `geoman-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }
      } catch (error) {
        console.error('Error setting layer properties:', error)
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
      const latest = latestMessage.content as GeoJSON.FeatureCollection
      // clear any `geomanCreated properties on new data, since we wish to delete old data
      latest.features.forEach((feature) => {
        if (feature.properties && feature.properties.geomanCreated) {
          delete feature.properties.geomanCreated
        }
      })
      return latest
    } else {
      return undefined
    }
  }, [latestMessage])

  useEffect(() => {
    // manually created features get added to the map.  But, once user has `saved`, when
    // they get a new message (with all features) there will be both the manually added one, 
    // and the new instance of ot.  So, when we get a new message ,delete any manually
    // created features.
    // TODO: this could break if multiple people editing map, since local edits could be lost 
    // if someone else edits map
    mapRef.current?.eachLayer((layer: L.Layer) => {
        const geoJSONLayer = layer as L.GeoJSON
        const feature = geoJSONLayer.feature as GeoJSON.Feature
        if (feature && feature.properties && feature.properties.geomanCreated) {
          // see if this is already present in new features
          const featureId = feature.properties.id
          if (currentFeatures?.features.some((f) => f.properties?.id === featureId)) {
            console.log('removing', featureId)
            layer.remove()
          }
        }
    })

  }, [currentFeatures])
  
  
  // Function to handle map modifications
  const handleMapModified = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // Function to capture the current map state and send as a message
  const captureAndSendMapState = useCallback(() => {
    if (!mapRef.current) return
    
    const features: GeoJSON.Feature[] = []
    const processedIds = new Set<string>()
    
    // Get all layers from the map, including Geoman-created layers
    mapRef.current.eachLayer((layer) => {
      const geoJSONLayer = layer as unknown as GeoJSONLayer
      
      // Check if this layer has the toGeoJSON method (is a feature layer)
      if (layer && 'toGeoJSON' in layer) {
        try {
          const feature = geoJSONLayer.toGeoJSON()
          
          // Skip the base tile layer and avoid duplicates
          if (feature.type === 'Feature') {
            // Check if this feature has an ID and hasn't been processed yet
            const featureId = feature.properties?.id
            if (featureId && !processedIds.has(featureId)) {
              processedIds.add(featureId)
              features.push(feature)
            } else if (!featureId) {
              // For features without IDs (like initial features)
              features.push(feature)
            }
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
            onEachFeature={(feature) => {
              if (!feature.properties) {
                feature.properties = {}
              }
              // Store the original feature ID for identification
              if (!feature.properties.id) {
                feature.properties.id = `feature-${Date.now()}-${Math.floor(Math.random() * 1000)}`
              }
            }}
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
