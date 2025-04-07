# War-Rooms-X: XMPP Interaction Design

This document defines how the War-Rooms-X system uses XMPP protocols—via OpenFire—for communication, data synchronization, and state management.

---

## 🧠 Purpose
The XMPP layer underpins real-time communication and distributed state sharing in War-Rooms-X. It is used for:
- Messaging (plain and structured)
- Game state propagation
- Role-based room permissions
- Template and metadata distribution

---

## 🧩 Core Components

### 1. **XMPP Server**
- **OpenFire** with:
  - MUC (Multi-User Chat) support
  - PubSub plugin (for game state, templates, etc.)
  - REST plugin (for admin configuration)

### 2. **MUC (Multi-User Chat) Rooms**
- Used for all chat communication
- Room naming:
  - Normal rooms: `blue_chat`, `red_rfi`
  - Special/system rooms: `__system_log`, `_admin`

### 3. **PubSub Nodes**
Used for dynamic state management and content sharing:

| Node                    | Purpose                          |
|-------------------------|----------------------------------|
| `warroomsx/gamestate`  | Current turn, phase, date/time   |
| `warroomsx/templates`  | All structured message schemas   |
| `warroomsx/rooms/{id}` | Room-specific metadata           |
| `warroomsx/wargame`    | Static metadata (name, interval) |

---

## 💬 Messaging Model

### Message Types
- **Plain**: Free-text chat
- **Structured**: Rendered via RJSF from JSON Schema

### Message Fields
Each message includes:
```json
{
  "id": "uuid",
  "timestamp": "2025-06-01T10:00Z",
  "sender": {
    "username": "blue_co",
    "role": "CO",
    "force": "Blue"
  },
  "room": "blue_chat",
  "gameTurn": 2,
  "phase": "Planning",
  "type": "structured",
  "template": "intrep",
  "content": {
    "location": "Sector 9B",
    "confidence": "High"
  }
}
```

### System Messages
- Messages like login events and turn changes are posted to `__system_log`
- These messages are excluded from standard room lists

---

## 🔁 Game State Sync

### Node: `warroomsx/gamestate`
- Publishes:
```json
{
  "turn": 3,
  "phase": "Adjudication",
  "game_time": "2025-06-01T10:00Z"
}
```
- Subscribed to by all clients
- Changes triggered by Game Control only

---

## 🧾 Template Distribution

### Node: `warroomsx/templates`
- Stores templates as JSON Schema documents
- Template assignment metadata stored in:
  - `warroomsx/rooms/{room}`
- Templates filtered client-side based on:
  - Player’s role and force
  - Current game phase

---

## 🔐 Room Permissions
- Defined by Game Control in admin UI
- Stored in `warroomsx/rooms/{room}`
```json
{
  "write_permissions": {
    "Planning": ["Red CO", "Blue CO"],
    "Adjudication": ["Game Control"]
  }
}
```
- Enforced by UI; OpenFire only enforces presence

---

## 👁️ Visibility Rules
- Rooms prefixed with `__` are system/internal:
  - Not shown in FlexLayout
  - Viewable only via modals or admin views
- All other rooms visible if the user is a participant

---

## 🚦 Presence Handling
- XMPP handles presence per room
- Players show as "joined" when they enter a room
- Useful for admin diagnostics and future moderation features

---

## 📤 Message Sending Flow
1. Player sends plain/structured message
2. Message is posted to appropriate MUC
3. If `useMessageReadControls` is enabled:
   - Message ID is tracked in local state
4. Message is rendered in scrollable view with metadata

---

## 📝 Future Enhancements
- Use `XEP-0333` (Chat Markers) for server-based read tracking
- Store message history in XMPP archive (XEP-0313)
- Add presence-based moderation for live observer roles

---

This document defines the runtime communication backbone for War-Rooms-X and guides implementation of all real-time features.

