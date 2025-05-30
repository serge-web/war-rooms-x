import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import './index.css'
import { useRoom } from '../useRoom'
import { MapRoomConfig, RoomDetails, RoomType, GameMessage, MessageDetails } from '../../../../types/rooms-d'
import { ConfigProvider, Button, Space, Tooltip, ThemeConfig } from 'antd'
import { MapContainer, TileLayer, GeoJSON, useMap, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { GeoJSON as LeafletGeoJSON, DivIcon, LatLngExpression } from 'leaflet'
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
  messages?: GameMessage[]
  theme?: ThemeConfig
  sendMessage?: (messageType: MessageDetails['messageType'], content: object) => void
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

      // special case: new text blocks don't have a feature
      if (!layer.feature) {
        layer.feature = layer.toGeoJSON()
      }

      // if it's a circle, we need to copy `radius` to teh properties
      if (layer.options && layer.options.radius) {
        if (!layer.feature.properties) {
          layer.feature.properties = {}
        }
        layer.feature.properties.radius = layer.options.radius
      }

      // note: we can't copy the text from options to feature, since
      // at point of creation the text hasn't been provided
      
      // Store the original feature for identification
      try {
        // Add a property to identify this as a Geoman-created layer
        layer.feature = layer.toGeoJSON()
        if (layer.feature.properties) {
          layer.feature.properties.geomanCreated = true
        }
        if (!layer.feature.id) {
          layer.feature.id = `geoman-${new Date().toISOString()}-${Math.floor(Math.random() * 1000)}`
        }
      } catch (error) {
        console.error('Error setting layer properties:', error)
      }
      
      // Notify that the map has been modified
      onMapModified()
    }
    
    // Add event listeners for map modifications
    const modifiedEvents: string[] = ['pm:remove', 'pm:edit', 'pm:dragend', 'pm:cut']
    modifiedEvents.forEach((event) => {
      map.on(event, onMapModified)
    })
    map.on('pm:create', handleCreate)
    
    return () => {
      // Cleanup
      if (geomanMap.pm) {
        geomanMap.pm.removeControls()
      }
      
      // Remove event listeners
      map.off('pm:create', handleCreate)
      modifiedEvents.forEach((event) => {
        map.off(event, onMapModified)
      })
    }
  }, [map, onMapModified, geoJsonLayerRef])
  
  return null
}

// Custom component to render text labels on the map
const TextMarker: React.FC<{
  position: LatLngExpression,
  text: string
}> = ({ position, text }) => {
  // Create a custom div icon with the text
  const icon = new DivIcon({
    className: 'map-text-label',
    html: `<div>${text}</div>`,
    iconSize: [100, 40],
    iconAnchor: [50, 20]
  })

  return (
    <Marker 
      position={position} 
      icon={icon}
      interactive={true}
    />
  )
}

// The core component that accepts props directly
const MapContent: React.FC<MapProps> = ({ 
  room, 
  messages = [], 
  theme, 
  sendMessage = () => console.warn('sendMessage not provided to MapContent')
}) => {
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
    if (latestMessage && latestMessage.details.messageType === 'map') {
      const latest = latestMessage.content as GeoJSON.FeatureCollection
      return latest
    } else {  
      return undefined
    }
  }, [latestMessage])

  console.log('current messages', messages)

  useEffect(() => {
    // manually created features get added to the map.  But, once user has `saved`, when
    // they get a new message (with all features) there will be both the manually added one, 
    // and the new instance of it.  So, when we get a new message, de-dupe the features.
    const featureHandled: string[] = []
    mapRef.current?.eachLayer((layer: L.Layer) => {
      const geoJSONLayer = layer as L.GeoJSON
      const feature = geoJSONLayer.feature as GeoJSON.Feature
      if (feature?.id) {
        if (!featureHandled.includes(feature.id as string)) {
          featureHandled.push(feature.id as string)
        } else {
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
            const featureId = feature.id as string
            if (featureId && !processedIds.has(featureId)) {
              processedIds.add(featureId)
              features.push(feature)
            } else if (!featureId) {
              // For features without IDs (like initial features)
              features.push(feature)
            }
          }
          // for new text markers we need to copy the text and textMarker
          // flag from optionts to properties
          const layerOptions = layer.options as {
            textMarker?: boolean
            text?: string
          }
          const isAMarker = layerOptions?.textMarker
          const hasText = layerOptions?.text
          if(feature.properties && isAMarker && hasText) {
            feature.properties.text = layerOptions.text
            feature.properties.textMarker = true
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

  const isTextMarker = (feature: GeoJSON.Feature): boolean => {
    return feature.properties?.textMarker === true
  }

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
            filter={(f) => !isTextMarker(f)}
          /> }
          
          {/* Render text labels for point features */}
          {currentFeatures && currentFeatures.features
            .filter(isTextMarker)
            .map(feature => {
              // Type assertion for Point geometry which has coordinates
              const coords = (feature.geometry as GeoJSON.Point).coordinates
              return (
                <TextMarker 
                  key={feature.id as string}
                  position={[coords[1], coords[0]]}
                  text={feature.properties!.text as string}
                />
              )
            })
          }
          <GeomanControls 
            onMapModified={handleMapModified} 
            mapRef={mapRef} 
            geoJsonLayerRef={geoJsonLayerRef}
          />
        </MapContainer>
        <div className="map-controls">
          <Space>
            <Tooltip title={hasUnsavedChanges ? 'Share the current map state' : 'No unsaved changes'}>
              <Button 
                type="primary" 
                onClick={captureAndSendMapState} 
                disabled={!hasUnsavedChanges}
              >
                Share updated map
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
    </ConfigProvider>
  )
  
}

// Create a backward-compatible wrapper that uses the useRoom hook
const MapContentWrapper: React.FC<{room: RoomType}> = ({ room }) => {
  const { theme, messages, sendMessage } = useRoom(room)
  return (
    <MapContent
      room={room}
      theme={theme}
      messages={messages}
      sendMessage={sendMessage}
    />
  )
}

// For compatibility with existing code, export the wrapper as default
export default MapContentWrapper

// Also export the core component for direct use in tests/stories
export { MapContent }
