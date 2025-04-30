import { ReactElement } from 'react'

/**
 * Interface for room type strategies
 * Each room type implements this interface to provide specific behavior
 */
export interface RoomTypeStrategy<T = unknown> {
  /**
   * Unique identifier for the room type
   */
  id: string

  /**
   * Human-readable label for the room type
   */
  label: string

  /**
   * Validates if the provided configuration is valid for this room type
   * @param config Configuration to validate
   * @returns True if the configuration is valid
   */
  isConfigValid(config: T): config is T

  /**
   * Renders a read-only view of the room configuration for admin UI
   * @param config Room configuration
   * @returns React element for displaying the configuration
   */
  renderShow(config: T): ReactElement

  /**
   * Renders an editable view of the room configuration for admin UI
   * @param config Room configuration
   * @param onChange Callback for when the configuration changes
   * @returns React element for editing the configuration
   */
  renderEdit(config: T, onChange: (config: T) => void): ReactElement
}
