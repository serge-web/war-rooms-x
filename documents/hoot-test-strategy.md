# How to test hooks without target server

Most of our hooks receive an xmppClient parameter/prop. When this is `null`, it means the hook should provide mock data.

This mode will be useful for unit testing.

# Hooks to cover with unit testing

## Core Hooks

1. **useIndexedDBData** - `/src/hooks/useIndexedDBData.ts`
   - Tests should verify data loading, error handling, and state management
   - Mock IndexedDB operations using fake-indexeddb or jest-localstorage-mock

2. **usePubSub** - `/src/hooks/usePubSub.ts`
   - Test with null xmppClient to verify mock data path
   - Test document updates, subscriptions, and error handling
   - Verify state updates when document changes

3. **useTemplates** - `/src/hooks/useTemplates.ts`
   - Test with null xmppClient to verify mock templates are loaded
   - Test loading state handling
   - Verify templates are correctly set in state

## Player View Hooks

4. **useRooms** - `/src/components/PlayerView/Rooms/RoomsList/useRooms.ts`
   - Test with null xmppClient to verify mock rooms filtering logic
   - Verify rooms are correctly filtered based on player ID and force
   - Test admin vs. non-admin room visibility

5. **useRoom** - `/src/components/PlayerView/Rooms/useRoom.ts`
   - Test room joining, message handling, and history loading
   - Verify message sending functionality
   - Test error handling for unavailable rooms

6. **useGameState** - `/src/components/PlayerView/GameState/useGameState.ts`
   - Test game state loading and updates
   - Verify state transitions and event handling
   - Test with mock game state data

7. **useGameSetup** - `/src/components/PlayerView/GameState/useGameSetup.ts`
   - Test game initialization and setup process
   - Verify configuration loading and validation

8. **usePlayerDetails** - `/src/components/PlayerView/UserDetails/usePlayerDetails.ts`
   - Test player profile loading and updates
   - Verify authentication state management

# Testing Strategy

## Setup

1. Use React's built-in testing capabilities with `@testing-library/react` for testing hooks
2. Create wrapper components to test hooks in a more realistic context
3. Use Jest's mock functions to simulate XMPP client behavior

## Test Structure

For each hook, implement the following test cases:

1. **Initialization Test**
   - Verify the hook initializes with correct default values
   - Check that loading states are correctly set

2. **Mock Data Path Test**
   - Pass null for xmppClient
   - Verify the hook correctly uses mock data
   - Test different mock data scenarios

3. **Live Client Path Test**
   - Create a mock XMPP client that simulates the real client's behavior
   - Test interactions with the mock client
   - Verify error handling when client operations fail

4. **State Updates Test**
   - Trigger state changes through the hook's API
   - Verify the hook's state is updated correctly
   - Test that callbacks and effects fire as expected

5. **Edge Cases Test**
   - Test behavior when data is undefined, null, or malformed
   - Verify error handling and recovery
   - Test performance with large data sets

## Example Test Implementation

```typescript
// Example test for useTemplates
import { render, screen, waitFor } from '@testing-library/react'
import { useTemplates } from '../src/hooks/useTemplates'

// Create a test wrapper component that uses the hook
function TemplatesTestComponent() {
  const { templates } = useTemplates()
  return (
    <div>
      <h1>Templates</h1>
      <ul data-testid="templates-list">
        {templates.map(template => (
          <li key={template.id} data-testid={`template-${template.id}`}>
            {template.id}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Mock dependencies
const mockTemplates = [
  { id: 'template1', schema: { type: 'object' }, uiSchema: {} },
  { id: 'template2', schema: { type: 'object' }, uiSchema: {} }
]

const mockUseIndexedDBData = jest.fn()
jest.mock('../src/hooks/useIndexedDBData', () => ({
  useIndexedDBData: () => mockUseIndexedDBData()
}))

const mockUseWargame = jest.fn()
jest.mock('../src/contexts/WargameContext', () => ({
  useWargame: () => mockUseWargame()
}))

describe('useTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load mock templates when xmppClient is null', async () => {
    // Set up mocks
    mockUseWargame.mockReturnValue({
      xmppClient: null
    })
    
    mockUseIndexedDBData.mockReturnValue({
      data: mockTemplates,
      loading: false
    })
    
    // Render the component that uses the hook
    render(<TemplatesTestComponent />)
    
    // Wait for the templates to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('templates-list').children).toHaveLength(2)
    })
    
    // Verify templates are loaded from mock data
    expect(screen.getByTestId('template-template1')).toBeInTheDocument()
    expect(screen.getByTestId('template-template2')).toBeInTheDocument()
  })
})
```

## Implementation Plan

1. Create a `hooks` directory under `src/rooms-test/`
2. Implement tests for core hooks first (useIndexedDBData, usePubSub)
3. Then implement tests for feature-specific hooks
4. Integrate hook tests into the CI pipeline
5. Set coverage thresholds for hooks to 90%