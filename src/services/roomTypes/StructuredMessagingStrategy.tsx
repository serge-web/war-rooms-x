import { ReactElement } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'

/**
 * Configuration interface for structured messaging rooms
 */
export interface StructuredMessagingConfig {
  roomType: 'structured'
  templateIds: string[]
}

/**
 * Strategy implementation for structured messaging rooms
 */
export class StructuredMessagingStrategy implements RoomTypeStrategy<StructuredMessagingConfig> {
  /**
   * Unique identifier for structured messaging room type
   */
  public id = 'structured'

  /**
   * Human-readable label for structured messaging room type
   */
  public label = 'Structured Messaging'

  /**
   * Validates if the provided configuration is valid for a structured messaging room
   * @param config Configuration to validate
   * @returns Type guard for StructuredMessagingConfig
   */
  public isConfigValid(config: StructuredMessagingConfig): config is StructuredMessagingConfig {
    return (
      config !== null &&
      typeof config === 'object' &&
      config.roomType === 'structured' &&
      Array.isArray(config.templateIds)
    )
  }

  /**
   * Renders a read-only view of the structured messaging room configuration for admin UI
   * @param config Structured messaging room configuration
   * @returns React element for displaying the configuration
   */
  public renderShow(config: StructuredMessagingConfig): ReactElement {
    return (
      <div>
        <h3>Structured Messaging Configuration</h3>
        <p>Room Type: {config.roomType}</p>
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
   * Renders an editable view of the structured messaging room configuration for admin UI
   * @param config Structured messaging room configuration
   * @param onChange Callback for when the configuration changes
   * @returns React element for editing the configuration
   */
  public renderEdit(
    config: StructuredMessagingConfig,
    onChange: (config: StructuredMessagingConfig) => void
  ): ReactElement {
    // In a real implementation, this would include a dropdown or multi-select
    // to choose from available templates
    return (
      <div>
        <h3>Edit Structured Messaging Configuration</h3>
        <p>Template selection would be implemented here</p>
        <p>{JSON.stringify([config, !!onChange])}</p>
        {/* This would be replaced with actual form elements */}
      </div>
    )
  }
}
