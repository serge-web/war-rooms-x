# War-Rooms-X: Message Format Schema

This document defines the canonical structure of messages exchanged in War-Rooms-X via XMPP MUC rooms. The schema supports both plain text and structured messages, enriched with metadata to support auditing, filtering, rendering, and export.

---

## 🧾 Message Envelope
Every message transmitted within the system—regardless of type—shares the following envelope:

```json
{
  "id": "uuid",                  // Unique message ID (client or server-generated)
  "timestamp": "2025-06-01T10:00Z", // ISO 8601 UTC
  "sender": {
    "username": "blue_co",
    "role": "CO",
    "force": "Blue"
  },
  "room": "blue_chat",
  "turn": {
    "gameTurn": 2,
    "phase": "Planning"
  },
  "phase": "Planning",
  "type": "plain" | "structured",
  "content": "..." | { ... }     // See below for message types
}
```

---

## 💬 Message Types

### 1. Plain Text Messages
```json
{
  "type": "plain",
  "content": "Requesting update on convoy arrival."
}
```
- Displayed as-is in chat log
- May contain line breaks
- No structured rendering required

### 2. Structured Messages
```json
{
  "type": "structured",
  "template": "intrep",
  "content": {
    "location": "Sector 14C",
    "observedAt": "09:50Z",
    "assetType": "Submarine",
    "confidence": "High"
  }
}
```
- `template` field references a schema in the `templates` PubSub collection
- `content` must conform to that schema
- Rendered as outline list of field names and values

---

## 🏷️ Metadata Fields

| Field          | Description                                  |
|----------------|----------------------------------------------|
| `id`           | Unique UUID for deduplication                |
| `timestamp`    | When the message was created/sent            |
| `sender`       | Player’s identity (force + role)             |
| `room`         | Room ID (matches MUC room name)              |
| `gameTurn`     | Numeric game turn (from game state)          |
| `phase`        | Game phase at time of sending                |
| `type`         | `"plain"` or `"structured"`                  |
| `template`     | ID of structured template (if structured)    |
| `content`      | Actual message body (string or object)       |

---

## 📋 Validation & Usage
- Plain text messages are validated as `non-empty string`
- Structured messages:
  - Validated via JSON Schema before sending (using RJSF)
  - Rendered using predefined UI layout if available (uiSchema)
  - Saved in full for audit/review/export

---

## 📤 Export Considerations
- Messages are exported in full envelope format
- JSON export retains:
  - Game turn, timestamp, player info
  - Formatted content + raw structured values
- Future export formats may include:
  - Flattened CSV (structured only)
  - Printable PDF transcript

---

## 📝 Future Extensions
- Add `readBy[]` list for message read tracking (per user)
- Support attachments: file/image metadata + URL
- Add `edited` timestamp if message updates are allowed

---

This schema defines a consistent and extensible message format for all gameplay and admin communications in War-Rooms-X.

