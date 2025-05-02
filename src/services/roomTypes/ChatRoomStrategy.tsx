import { ComponentType } from 'react'
import { EditComponentProps, RoomTypeStrategy, ShowComponentProps } from './RoomTypeStrategy'
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

  /**
   * Returns a component for displaying the chat room configuration in read-only mode
   * @returns React component that accepts ShowComponentProps<ChatRoomConfig>
   */
  public getShowComponent(): ComponentType<ShowComponentProps<ChatRoomConfig>> {
    return ({ config }) => (
      <div>
        <h3>Chat Room Configuration</h3>
        <p>Room Type: {config.roomType}</p>
      </div>
    )
  }

  /**
   * Returns a component for editing the chat room configuration
   * @returns React component that accepts EditComponentProps<ChatRoomConfig>
   */
  public getEditComponent(): ComponentType<EditComponentProps<ChatRoomConfig>> {
    return ({ config, onChange }) => (
      <div>
        <h3>Edit Chat Room Configuration</h3>
        <p>Room Type: {config.roomType}</p>
        <button
          onClick={() => {
            // Example of using onChange
            onChange({
              ...config,
              // This is just a placeholder to show we're using onChange
              roomType: 'chat'
            })
          }}
        >
          Update Configuration
        </button>
        <p>No additional configuration needed for basic chat rooms.</p>
      </div>
    )
  }
}
