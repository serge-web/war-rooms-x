import { ComponentType } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'
import { FormRoomConfig } from '../../types/rooms-d'
import { AutocompleteArrayInput, ReferenceArrayField, ReferenceArrayInput } from 'react-admin'

/**
 * Strategy implementation for structured messaging rooms
 */
export class StructuredMessagingStrategy implements RoomTypeStrategy<FormRoomConfig> {
  /**
   * Unique identifier for structured messaging room type
   */
  public id = 'form'

  /**
   * Human-readable label for structured messaging room type
   */
  public label = 'Structured Messaging'

  /**
   * Validates if the provided configuration is valid for a structured messaging room
   * @param config Configuration to validate
   * @returns Type guard for FormRoomConfig
   */
  public isConfigValid(config: FormRoomConfig): config is FormRoomConfig {
    return (
      config !== null &&
      typeof config === 'object' &&
      config.roomType === 'form' &&
      Array.isArray(config.templateIds)
    )
  }

  /** default (bare) config for this room type */
  public defaultConfig: FormRoomConfig = {
    roomType: 'form',
    templateIds: []
  }

  /**
   * Returns a component for displaying the structured messaging room configuration in read-only mode
   * @returns React component that accepts ShowComponentProps<FormRoomConfig>
   */
  public getShowComponent(): ComponentType {
    return () => (
        <ReferenceArrayField source="details.specifics.templateIds" reference="templates" />
      )
    }
  

  /**
   * Returns a component for editing the structured messaging room configuration
   * @returns React component that accepts EditComponentProps<FormRoomConfig>
   */
  public getEditComponent(): ComponentType {
    return  () => {
      return (
          <ReferenceArrayInput source="details.specifics.templateIds"  reference="templates">
            <AutocompleteArrayInput optionText="schema.title" optionValue="id" label="Templates" />
          </ReferenceArrayInput>
      )
    }
  }
}
