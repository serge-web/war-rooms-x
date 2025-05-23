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

## References
- [XEP-0308: Last Message Correction](https://xmpp.org/extensions/xep-0308.html)
- [XEP-0280: Message Carbons](https://xmpp.org/extensions/xep-0280.html)
- [XEP-0313: Message Archive Management](https://xmpp.org/extensions/xep-0313.html)
- [XMPP Compliance Suites 2022 - Message Modification](https://xmpp.org/extensions/xep-0424.html)
