import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminMessages from '../components/PlayerView/AdminMessages'
import { mockRooms } from './__mocks__/mockRooms'
import { Room } from '../components/PlayerView/RoomContent'

// Mock the RoomContent component to simplify testing
jest.mock('./RoomContent', () => {
  return {
    __esModule: true,
    default: ({ room }: { room: Room }) => (
      <div data-testid="mocked-room-content">
        <div data-testid="room-name">{room.name}</div>
        <div data-testid="message-count">{room.messages.length}</div>
      </div>
    )
  }
})

describe('AdminMessages Component', () => {
  test('renders admin messages from the __admin room', () => {
    const { getByTestId, getByText } = render(<AdminMessages />)
    
    // Check if the component renders with the correct title
    expect(getByText('Admin Messages')).toBeInTheDocument()
    
    // Check if RoomContent is rendered with the admin room
    expect(getByTestId('mocked-room-content')).toBeInTheDocument()
    
    // Verify the admin room name is displayed
    const adminRoom = mockRooms.find(room => room.id === '__admin')
    expect(getByTestId('room-name')).toHaveTextContent(adminRoom?.name || '')
    
    // Verify message count matches
    expect(getByTestId('message-count')).toHaveTextContent(
      adminRoom?.messages.length.toString() || '0'
    )
  })
  
  test('renders fallback message when admin room is not found', () => {
    // Temporarily modify mockRooms to simulate missing admin room
    const originalMockRooms = [...mockRooms]
    const filteredMockRooms = mockRooms.filter(room => room.id !== '__admin')
    
    mockRooms.splice(0, mockRooms.length, ...filteredMockRooms)
    
    const { getByText } = render(<AdminMessages />)
    
    // Check if fallback message is displayed
    expect(getByText('No admin messages available')).toBeInTheDocument()
    
    // Restore original mockRooms
    mockRooms.splice(0, mockRooms.length, ...originalMockRooms)
  })
})
