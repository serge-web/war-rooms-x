import { ComponentType } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'
import { MapRoomConfig } from '../../types/rooms-d'
import { TextField, TextInput } from 'react-admin'

/**
 * Strategy implementation for structured messaging rooms
 */
export class MapRoomStrategy implements RoomTypeStrategy<MapRoomConfig> {
  /**
   * Unique identifier for structured messaging room type
   */
  public id = 'map'

  /**
   * Human-readable label for structured messaging room type
   */
  public label = 'Map'

  public description = 'A room that contains a series of map overlays'

  /**
   * Validates if the provided configuration is valid for a structured messaging room
   * @param config Configuration to validate
   * @returns Type guard for FormRoomConfig
   */
  public isConfigValid(config: MapRoomConfig): config is MapRoomConfig {
    return (
      config !== null &&
      typeof config === 'object' &&
      config.roomType === 'map' &&
      typeof config.backdropUrl === 'string')
  }

  /** default (bare) config for this room type */
  public defaultConfig: MapRoomConfig = {
    roomType: 'map',
    backdropUrl: ''
  }

  /**
   * Returns a component for displaying the structured messaging room configuration in read-only mode
   * @returns React component for displaying the configuration
   */
  public showComponent: ComponentType = () => {
    return <TextField source="details.specifics.backdropUrl" label="Backdrop URL" />
  }

  /**
   * Returns a component for editing the structured messaging room configuration
   * @returns React component for editing the configuration
   */
  public editComponent: ComponentType = () => {
    return (
      <TextInput source="details.specifics.backdropUrl" helperText="URL of the tiled backdrop image" label="Backdrop URL" />
    )
  }
}
