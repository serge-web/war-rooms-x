import { ReactElement } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'
import { ChatRoomConfig } from '../types/rooms-d'

/**
 * Strategy implementation for standard chat rooms
 */
export class ChatRoomStrategy implements RoomTypeStrategy<ChatRoomConfig> {
  /**
   * Unique identifier for chat room type
   */
  public id = 'chat'

  /**
   * Human-readable label for chat room type
   */
  public label = 'Chat Room'

  /**
   * Validates if the provided configuration is valid for a chat room
   * @param config Configuration to validate
   * @returns Type guard for ChatRoomConfig
   */
  public isConfigValid(config: ChatRoomConfig): config is ChatRoomConfig {
    return (
      config !== null &&
      typeof config === 'object' &&
      config.roomType === 'chat'
    )
  }

  /**
   * Renders a read-only view of the chat room configuration for admin UI
   * @param config Chat room configuration
   * @returns React element for displaying the configuration
   */
  public renderShow(config: ChatRoomConfig): ReactElement {
    // Simple display for chat room configuration
    // This would be expanded in a real implementation
    return (
      <div>
        <h3>Chat Room Configuration</h3>
        <p>Room Type: {config.roomType}</p>
      </div>
    )
  }

  /**
   * Renders an editable view of the chat room configuration for admin UI
   * @param config Chat room configuration
   * @param onChange Callback for when the configuration changes
   * @returns React element for editing the configuration
   */
  public renderEdit(
  ): ReactElement {
    // Simple editor for chat room configuration
    // This would be expanded in a real implementation
    return (
      <div>
        <h3>Edit Chat Room Configuration</h3>
        <p>No additional configuration needed for basic chat rooms.</p>
      </div>
    )
  }
}
