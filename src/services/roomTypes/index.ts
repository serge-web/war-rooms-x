import { RoomTypeFactory } from './RoomTypeFactory'
import { ChatRoomStrategy } from './ChatRoomStrategy'
import { SimpleFormsStrategy } from './SimpleFormsStrategy'
import { MapRoomStrategy } from './MapRoomStrategy'

// Initialize the room type factory
const roomTypeFactory = RoomTypeFactory.getInstance()

// Register all room type strategies
roomTypeFactory.register(new ChatRoomStrategy())
roomTypeFactory.register(new SimpleFormsStrategy())
roomTypeFactory.register(new MapRoomStrategy())

// Export the factory and strategies for use throughout the application
export { roomTypeFactory }
