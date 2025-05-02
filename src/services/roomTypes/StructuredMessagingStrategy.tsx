import { ComponentType } from 'react'
import { EditComponentProps, RoomTypeStrategy, ShowComponentProps } from './RoomTypeStrategy'
import { FormRoomConfig } from '../../types/rooms-d'
import { AutocompleteArrayInput, ReferenceArrayInput } from 'react-admin'

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

  /**
   * Returns a component for displaying the structured messaging room configuration in read-only mode
   * @returns React component that accepts ShowComponentProps<FormRoomConfig>
   */
  public getShowComponent(): ComponentType<ShowComponentProps<FormRoomConfig>> {
    return ({ config }) => (
        <div>
          <p>Templates:</p>
          <ul>
            {config.templateIds.map((templateId) => (
              <li key={templateId}>{templateId}</li>
            ))}
          </ul>
        </div>
      )
    }
  

  /**
   * Returns a component for editing the structured messaging room configuration
   * @returns React component that accepts EditComponentProps<FormRoomConfig>
   */
  public getEditComponent(): ComponentType<EditComponentProps<FormRoomConfig>> {
    return  () => {
      return (
          <ReferenceArrayInput source="details.specifics.templateIds"  reference="templates">
            <AutocompleteArrayInput optionText="schema.title" optionValue="id" label="Templates" />
          </ReferenceArrayInput>
      )
    }
  }
}
