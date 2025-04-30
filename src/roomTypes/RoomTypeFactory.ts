import { RoomTypeStrategy } from './RoomTypeStrategy'

/**
 * Factory for managing room type strategies
 * Singleton pattern to ensure consistent access across the application
 */
export class RoomTypeFactory {
  private static instance: RoomTypeFactory
  private strategies: Record<string, RoomTypeStrategy> = {}

  /**
   * Get the singleton instance of the factory
   * @returns The RoomTypeFactory instance
   */
  public static getInstance(): RoomTypeFactory {
    if (!RoomTypeFactory.instance) {
      RoomTypeFactory.instance = new RoomTypeFactory()
    }
    return RoomTypeFactory.instance
  }

  /**
   * Register a new room type strategy
   * @param strategy The strategy to register
   */
  public register(strategy: RoomTypeStrategy): void {
    this.strategies[strategy.id] = strategy
  }

  /**
   * Get a strategy by its ID
   * @param id The strategy ID
   * @returns The strategy or undefined if not found
   */
  public get(id: string): RoomTypeStrategy | undefined {
    return this.strategies[id]
  }

  /**
   * List all available strategies
   * @returns Array of all registered strategies
   */
  public list(): RoomTypeStrategy[] {
    return Object.values(this.strategies)
  }
}
