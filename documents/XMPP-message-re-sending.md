# XMPP Message Re-sending and Editing

This document outlines the protocols, flows, and best practices for implementing message editing in XMPP-based chat applications, specifically for the WAR ROOMS project.

## Core Protocols

### 1. Message Correction (XEP-0308)
The primary extension for message editing is [XEP-0308: Last Message Correction](https://xmpp.org/extensions/xep-0308.html).

#### Key Features:
- Allows clients to indicate that a message replaces a previously sent message
- Uses a `<replace>` element with the original message's `id`
- Preserves the original message timestamp
- Works for both one-to-one and group chats (MUC)

#### Example:
```xml
<message 
  to='room@conference.example.com'
  type='groupchat'
  id='corrected-message-id'>
  <body>This is the corrected message</body>
  <replace xmlns='urn:xmpp:message-correct:0' id='original-message-id'/>
</message>
```

### 2. Message Carbons (XEP-0280)
- Ensures message corrections are synchronized across all user's devices
- Essential for maintaining consistent message history
- Particularly important for users logged in from multiple devices

```xml
<message from='user@example.com/phone'
         to='user@example.com/desktop'>
  <received xmlns='urn:xmpp:carbons:2'>
    <forwarded xmlns='urn:xmpp:forward:0'>
      <message 
        from='room@conference.example.com/user'
        to='user@example.com/phone'
        type='groupchat'
        id='corrected-message-id'>
        <body>This is the corrected message</body>
        <replace xmlns='urn:xmpp:message-correct:0' id='original-message-id'/>
      </message>
    </forwarded>
  </received>
</message>
```

### 3. Message Archive Management (XEP-0313)
- For persisting message history
- Ensures edited messages are properly stored and retrieved
- Important for users joining rooms after message edits occur

## Implementation Flow

### Message Editing Process
1. **Client-Side Edit**
   - User selects message to edit
   - Client displays edit interface with original message
   - User makes changes and confirms

2. **Sending the Correction**
   - Client sends new message with `<replace>` element
   - Original message ID is included in the `id` attribute
   - Message type remains the same (chat/groupchat)

3. **Server Processing**
   - Server validates user has permission to edit the message
   - Server verifies message exists and belongs to the user
   - Server broadcasts corrected message to all participants

4. **Client Handling**
   - Receiving clients match the message ID with their local copy
   - UI is updated to show edited message
   - Visual indication that message was edited is displayed

### Error Handling
- **Invalid Message ID**: Server should return `<bad-request/>` error
- **Permission Denied**: Return `<forbidden/>` error if user can't edit
- **Message Not Found**: Return `<item-not-found/>` error
- **Rate Limiting**: Implement to prevent abuse

## Best Practices

### Security Considerations
1. **Authorization**
   - Only allow editing of own messages
   - Consider time window for edits (e.g., 5-15 minutes)
   - Log all edit actions for moderation

2. **Privacy**
   - Option to show edit history to room moderators
   - Consider if original message should be accessible to certain roles

3. **UI/UX**
   - Clearly indicate edited messages
   - Show edit history where appropriate
   - Handle concurrent edits gracefully

### Performance
- Minimize message size when sending corrections
- Consider batching multiple corrections if needed
- Cache message history locally to reduce server load

## WAR ROOMS Implementation Notes
- Use XEP-0308 for basic message correction
- Implement MUC-specific handling for room messages
- Consider adding custom extensions for:
  - Edit history tracking
  - Role-based edit permissions
  - Time-based edit restrictions

## Stanza.js Implementation

Stanza.js (https://github.com/legastero/stanza) provides comprehensive XMPP protocol support. Here's how to implement message editing using Stanza.js:

### 1. Setup and Configuration
```typescript
import { createClient, JID } from 'stanza'

// Create and configure the XMPP client
const client = createClient({
  jid: 'user@example.com/war-rooms',
  password: 'password',
  transports: {
    websocket: 'wss://xmpp.example.com:5280/ws'
  }
})

// Enable required XEPs
client.enableCarbons()
client.enableMAM()

// Connect to the server
await client.connect()
```

### 2. Sending Message Corrections
```typescript
// Send original message
const originalId = `msg-${Date.now()}`
await client.sendMessage({
  to: 'room@conference.example.com',
  type: 'groupchat',
  id: originalId,
  body: 'Original message'
})

// Send a correction
const correctedId = `msg-${Date.now()}`
await client.sendMessage({
  to: 'room@conference.example.com',
  type: 'groupchat',
  id: correctedId,
  body: 'Corrected message',
  replace: originalId  // Stanza.js handles the XEP-0308 formatting
})
```

### 3. Handling Incoming Corrections
```typescript
client.on('message', (msg) => {
  if (msg.type === 'groupchat' && msg.replace) {
    // This is a message correction
    const originalId = msg.replace
    const newBody = msg.body
    
    // Update your UI with the corrected message
    updateMessageInUI(originalId, {
      body: newBody,
      isEdited: true,
      editedAt: new Date(),
      editedBy: msg.from?.resource
    })
  }
})
```

### 4. Message Carbons Support
Stanza.js provides built-in support for message carbons:

```typescript
client.enableCarbons()

// Handle carbon-copied messages
client.on('carbon:received', (direction, carbon) => {
  if (carbon.message?.replace) {
    // Handle message correction from carbon copy
    const originalId = carbon.message.replace
    const newBody = carbon.message.body
    // Update UI accordingly
  }
})
```

### 5. Message Archive Management (MAM)
```typescript
// Query message history
const history = await client.searchHistory({
  with: 'room@conference.example.com',
  max: 50
})

// Process history results
history.results.forEach((result) => {
  if (result.forwarded?.message?.replace) {
    // Handle corrected message from history
    const originalId = result.forwarded.message.replace
    const newBody = result.forwarded.message.body
    // Update UI accordingly
  }
})
```

### 6. Error Handling
```typescript
try {
  await client.sendMessage({
    to: 'room@conference.example.com',
    type: 'groupchat',
    body: 'Corrected message',
    replace: originalId
  })
} catch (error) {
  if (error.error?.condition === 'forbidden') {
    console.error('Not allowed to edit this message')
  } else if (error.error?.condition === 'item-not-found') {
    console.error('Original message not found')
  } else {
    console.error('Error sending correction:', error)
  }
}
```

### 7. Best Practices with Stanza.js
- **Message Tracking**: Use the built-in `stanza.addMessageHandler()` for reliable message tracking
- **MUC Support**: Utilize `client.getRoom()` for MUC-specific functionality
- **State Management**: Leverage Stanza.js presence tracking for accurate user state
- **Error Recovery**: Implement reconnection logic with `client.reconnect()`
- **Rate Limiting**: Use `client.throttle()` to prevent flooding the server
- **Debugging**: Enable debug logging with `client.config.logLevel = 'debug'`
- **Message IDs**: Always generate unique message IDs using `client.getUniqueId('msg-')`

## Implementation (mock data)

For development and testing with mock data in IndexedDB, we'll implement message editing in the following way:

### 1. Update the Message Type
Extend the `Message` interface in `src/types/room.ts` to support editing:

```typescript
export interface Message {
  id: string
  body: string
  timestamp: Date
  from: string
  isEdited?: boolean
  editedAt?: Date
  originalId?: string // For tracking the original message ID in case of edits
}
```

### 2. Add Edit Methods to `useRoom` Hook
Update the `useRoom` hook in `src/hooks/useRoom.ts` to include message editing functionality:

```typescript
// In useRoom.ts
export function useRoom(roomId: string) {
  // ... existing code ...

  const editMessage = useCallback(async (messageId: string, newBody: string) => {
    if (!currentUser) return

    // Create a new message that replaces the old one
    const editedMessage: Message = {
      id: `msg-${Date.now()}`,
      body: newBody,
      from: currentUser.id,
      timestamp: new Date(),
      isEdited: true,
      editedAt: new Date(),
      originalId: messageId
    }

    // In mock mode, update IndexedDB
    if (isMock) {
      const tx = (await db).transaction('messages', 'readwrite')
      const store = tx.objectStore('messages')
      
      // Find the original message
      const original = await store.get(messageId)
      if (!original) return

      // Mark original as replaced
      await store.put({
        ...original,
        isReplaced: true,
        replacedBy: editedMessage.id
      })
      
      // Add the edited message
      await store.add({
        ...editedMessage,
        roomId
      })
      
      await tx.done
      
      // Trigger UI update
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== messageId)
        return [...filtered, editedMessage].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      })
    } else {
      // Real XMPP implementation would go here
      await client.sendMessage({
        to: roomId,
        type: 'groupchat',
        body: newBody,
        replace: messageId
      })
    }
  }, [currentUser, isMock, roomId])

  // ... rest of the hook ...
  
  return {
    // ... other methods and state ...
    editMessage
  }
}
```

### 3. Update Message Component
Modify the message component to handle editing:

```typescript
// In Message.tsx
function Message({ message, canEdit = false }: { message: Message, canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.body)
  const { editMessage } = useRoom(message.roomId)

  const handleEdit = () => {
    if (editText.trim() && editText !== message.body) {
      editMessage(message.id, editText.trim())
    }
    setIsEditing(false)
  }

  // ... rest of the component
}
```

### 4. Update Mock Data Initialization
Ensure the mock data schema in `src/mock/initDB.ts` includes the new fields:

```typescript
// In initDB.ts
db.version(1).stores({
  messages: 'id, roomId, timestamp, [roomId+timestamp]',
  // ... other stores
})

// Add test messages with editing support
export async function addTestMessages() {
  await db.messages.bulkAdd([
    {
      id: 'msg-1',
      roomId: 'room1',
      body: 'Original message',
      from: 'user1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isEdited: false
    },
    // ... other test messages
  ])
}
```

### 5. Testing Strategy
Update test files to verify editing functionality:

```typescript
// In message.test.tsx
describe('Message Editing', () => {
  it('allows editing own messages', async () => {
    const { user } = setupTest()
    const message = { id: '1', body: 'Original', from: 'current-user' }
    render(<Message message={message} canEdit={true} />)
    
    await user.click(screen.getByLabelText('Edit message'))
    await user.type(screen.getByRole('textbox'), ' edited')
    await user.click(screen.getByText('Save'))
    
    expect(await screen.findByText('Original edited')).toBeInTheDocument()
    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })
})
```

### 6. UI/UX Considerations
- Show visual indicators for edited messages (e.g., "(edited)")
- Display edit history/timestamp on hover
- Implement a reasonable edit time window (e.g., 15 minutes)
- Show loading states during edit operations
- Handle concurrent edits gracefully

### 7. Migration Path
1. **Phase 1: Mock Implementation**
   - Implement and test with mock data
   - Add unit tests for the editing functionality
   - Create storybook stories for visual testing

2. **Phase 2: XMPP Protocol Validation**
   - Set up test environment with OpenFire server
   - Create integration tests for XEP-0308 compliance
   - Verify message correction behavior in MUC rooms
   - Test message carbons and archive synchronization

3. **Phase 3: Real XMPP Integration**
   - Implement the real XMPP integration using Stanza.js
   - Add feature flags to toggle between mock and XMPP backends
   - Test with both backends in parallel

4. **Phase 4: End-to-End Testing**
   - Add E2E tests covering both mock and XMPP scenarios
   - Test cross-device synchronization
   - Verify behavior under network conditions

### 8. OpenFire Integration Tests
Create dedicated integration tests in `src/rooms-test/integration/message-editing.spec.ts` to verify OpenFire's behavior:

```typescript
describe('OpenFire Message Editing', () => {
  let client1: XMPP.Client
  let client2: XMPP.Client
  const roomJid = 'test-room@conference.example.com'
  const testMessage = 'Test message ' + Math.random().toString(36).substring(7)
  let originalMessageId: string

  beforeAll(async () => {
    // Initialize two clients to simulate multiple participants
    client1 = await createTestClient('user1')
    client2 = await createTestClient('user2')
    
    // Join the test room with both clients
    await joinMuc(client1, roomJid, 'user1')
    await joinMuc(client2, roomJid, 'user2')
  })

  afterAll(async () => {
    await client1.disconnect()
    await client2.disconnect()
  })

  test('should allow message correction in MUC', async () => {
    // User1 sends a message
    const { id } = await client1.sendMessage({
      to: roomJid,
      type: 'groupchat',
      body: testMessage
    })
    originalMessageId = id

    // User2 should receive the original message
    const originalMsg = await waitForMessage(client2, { id })
    expect(originalMsg.body).toBe(testMessage)

    // User1 corrects the message
    const correctedText = testMessage + ' (edited)'
    await client1.sendMessage({
      to: roomJid,
      type: 'groupchat',
      body: correctedText,
      replace: originalMessageId
    })

    // User2 should receive the correction
    const correctedMsg = await waitForMessage(client2, { replace: originalMessageId })
    expect(correctedMsg.body).toBe(correctedText)
    expect(correctedMsg.replace).toBe(originalMessageId)
  })

  test('should handle message carbons for corrections', async () => {
    // Test that message corrections are properly carbon-copied to other resources
    // (Implementation depends on your carbon handling setup)
  })


  test('should persist corrections in MAM', async () => {
    // Query MAM for the room history
    const history = await client1.searchHistory({
      with: roomJid,
      max: 10
    })

    // Verify the correction is in the history
    const correction = history.results.find(
      (result) => 
        result.forwarded?.message?.replace === originalMessageId
    )
    
    expect(correction).toBeDefined()
    expect(correction.forwarded.message.body).toContain('(edited)')
  })
})
```

### Test Coverage Areas
1. **Basic Correction**
   - Verify message replacement works in MUC
   - Check message IDs and threading
   - Verify timestamps are preserved

2. **Edge Cases**
   - Editing messages from different devices
   - Offline message handling
   - Reconnection scenarios
   - Permission validation

3. **Performance**
   - Message size limits
   - Rate limiting
   - Large room performance

4. **Security**
   - Unauthorized edit attempts
   - Message forgery prevention
   - Edit history access controls

## References
- [XEP-0308: Last Message Correction](https://xmpp.org/extensions/xep-0308.html)
- [XEP-0280: Message Carbons](https://xmpp.org/extensions/xep-0280.html)
- [XEP-0313: Message Archive Management](https://xmpp.org/extensions/xep-0313.html)
- [XMPP Compliance Suites 2022 - Message Modification](https://xmpp.org/extensions/xep-0424.html)
