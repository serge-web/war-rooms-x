import { ComponentType } from 'react'

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

  /** default (bare) config for this room type */
  defaultConfig: T

  /**
   * Returns a component for displaying the room configuration in read-only mode
   * @returns React component that accepts ShowComponentProps<T>
   */
  showComponent: ComponentType

  /**
   * Returns a component for editing the room configuration
   * @returns React component that accepts EditComponentProps<T>
   */
  editComponent: ComponentType
}
