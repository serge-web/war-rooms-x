import { ComponentType } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'
import { FormRoomConfig, Template } from '../../types/rooms-d'
import { AutocompleteArrayInput, ListControllerResult, ReferenceArrayField, ReferenceArrayInput, WithListContext } from 'react-admin'
import { Chip } from '@mui/material'

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
   * @returns React component for displaying the configuration
   */
  public showComponent: ComponentType = () => {
    const renderTemplate = (template: Template) => {
      return <Chip size="small" label={template.schema?.title || template.id} />
    }
    const renderTemplates = (context: ListControllerResult<Template>) => {
      return <span>{context.data?.map(renderTemplate)}</span>
    }
    return (
      <ReferenceArrayField source="details.specifics.templateIds" reference="templates" >
        <WithListContext render={renderTemplates} />
      </ReferenceArrayField>
    )
  }

  /**
   * Returns a component for editing the structured messaging room configuration
   * @returns React component for editing the configuration
   */
  public editComponent: ComponentType = () => {
    return (
      <ReferenceArrayInput source="details.specifics.templateIds" reference="templates">
        <AutocompleteArrayInput optionText="schema.title" optionValue="id" label="Templates" />
      </ReferenceArrayInput>
    )
  }
}
