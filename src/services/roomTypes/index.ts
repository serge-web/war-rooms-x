import { RoomTypeFactory } from './RoomTypeFactory'
import { ChatRoomStrategy } from './ChatRoomStrategy'
import { StructuredMessagingStrategy } from './StructuredMessagingStrategy'

// Initialize the room type factory
const roomTypeFactory = RoomTypeFactory.getInstance()

// Register all room type strategies
roomTypeFactory.register(new ChatRoomStrategy())
roomTypeFactory.register(new StructuredMessagingStrategy())

// Export the factory and strategies for use throughout the application
export { roomTypeFactory }
