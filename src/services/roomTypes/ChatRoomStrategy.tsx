import { ComponentType } from 'react'
import { RoomTypeStrategy } from './RoomTypeStrategy'
import { ChatRoomConfig } from '../../types/rooms-d'

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

  /** default (bare) config for this room type */
  public defaultConfig: ChatRoomConfig = {
    roomType: 'chat'
  }

  /**
   * Returns a component for displaying the chat room configuration in read-only mode
   * @returns React component that accepts ShowComponentProps<ChatRoomConfig>
   */
  public getShowComponent(): ComponentType {
    return () => (
      <div>
        <h3>Chat Room Configuration</h3>
      </div>
    )
  }

  /**
   * Returns a component for editing the chat room configuration
   * @returns React component that accepts EditComponentProps<ChatRoomConfig>
   */
  public getEditComponent(): ComponentType {
    return () => (
      <div>
        <h3>Edit Chat Room Configuration</h3>
      </div>
    )
  }
}
