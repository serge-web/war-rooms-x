## War-Rooms-X: Distributed Wargaming Application — Requirements Document

### 🧭 Overview
War-Rooms-X is a browser-based, distributed wargaming platform built for training military officers. It supports role-based communication, structured message exchange, and real-time coordination. Exercises are overseen by Umpires and Observers who administer, monitor, and adjudicate gameplay. The backend uses OpenFire (XMPP) and React-based frontend clients.

---

### 🎯 Purpose
Enable distributed training exercises that simulate operational command environments. Supports free-text chat, structured messages, multi-room coordination, and replayable logs.

---

### 🧑‍💻 Roles & Access

- **Players**: Assigned to a force (Blue, Red, Green). Have roles (e.g., CO, Logistics).
- **Observers (White force)**: Read-only access to all rooms. May receive write access where required.
- **Umpires / Game Control (White force)**:
  - Manage game metadata, players, forces, rooms, and templates.
  - Advance game state (turn/phase).
  - Reset passwords, export logs, and oversee structured messaging.

---

### 🔐 Authentication & Access
- All users authenticate directly with OpenFire using XMPP credentials.
- Admins authenticate via OpenFire REST API for backend management.
- Game Control assigns and resets passwords.

---

### 🧱 Game Structure

#### Forces & Players
- Created by Game Control.
- Players are assigned to a force and have a role (e.g., Blue CO).
- Forces include optional icon (PNG only) and color tag.

#### Rooms
- Implemented as XMPP MUC rooms.
- Configured with:
  - Description
  - Assigned forces and players
  - Write permissions per game phase
  - Structured message templates (optional)
- Room names starting with `__` are system/internal and hidden from standard UI.

#### Templates
- Defined as JSON Schema using `react-json-schema-form-builder`.
- Rendered via RJSF.
- Stored as XMPP PubSub documents in a `templates` collection.
- Admins may preview templates before assignment.
- (Future) Parameterized templates support dynamic field values.

---

### 🕹️ Game State Control

- Controlled by Game Control player via a "Next" button.
- Game state includes:
  - Turn number
  - Game phase (e.g., Planning, Adjudication)
  - In-game date/time
- Broadcast via XMPP PubSub; all clients subscribe.
- Room permissions can vary based on phase.
- Turn advances are logged in `__system_log`.

---

### 📡 Real-Time Features

- Typing indicators
- Read status tracking (optional)
- Message timestamps
- Optimistic message posting
- Notifications for new messages

---

### 💬 Messaging Model

#### Types
- Plain text: simple scrollable chat
- Structured: rendered field/value outline from RJSF forms

#### Message Rendering
- Display sender force, role, timestamp
- Highlight force affiliation (e.g., with color tags)
- Structured messages show collapsible outlines

#### Read Controls (Optional)
- Enabled via metadata: `useMessageReadControls: true`
- Messages may be marked read/unread
- Stored client-side or (future) via XMPP protocol
- Includes:
  - Bulk "Mark All Read"
  - Unread filtering (`showUnreadOnly` toggle)
  - Excludes system rooms (`__system_*`)

---

### 📓 Audit Logging

- Implemented via a special MUC room: `__system_log`
- All players write to log on login:
  - E.g., "BLUE-CO has joined the game"
- Game Control logs turn changes, password resets, etc.
- White force can view via a popup modal
- System rooms are hidden from normal player UI

---

### 🛠️ Admin Interface (React-Admin)

#### Wargame Setup
- Name, description
- Start date/time
- Interval (e.g., P2DT6H)
- Phase model
- Turn model
- PubSub metadata node stores this config

#### Forces & Players
- Add/edit/delete forces
- Assign roles
- Set/reset passwords

#### Room Management
- Create rooms
- Assign forces/players
- Define write permissions per phase
- Attach templates per role/force
- Clone existing rooms
- Hidden `__` room support

#### Templates
- Create with form builder
- Preview using RJSF
- Assign by room/role/phase

#### Backup/Restore Metadata
- Export setup (no passwords/message history)
- Includes version metadata
- Restore overwrites current config
- Local-only storage (admin’s device)

#### Message Export
- Export message logs (JSON)
- Filter by room, turn/phase
- Includes metadata: sender, timestamp, type, template output

#### Password Reset
- Admin can search players
- Update passwords via REST
- Triggers audit message

---

### 🧪 Developer Support

#### React Hook Architecture
- `useWargame()` – game state
- `useRooms()` – all accessible rooms
- `useRoom(roomId)` – messages, postMessage, read tracking
- `useForce()` – logged-in force
- `useForces()` – all forces
- `usePlayer()` – logged-in player metadata
- `useTemplates()` – available templates
- `useTemplate(templateId)` – fetch individual template

All hooks reactive, testable, and subscribe to PubSub/XMPP or REST.

---

### ✅ Next Steps
- Define schema for PubSub documents (game state, rooms, templates)
- Implement hook scaffolding and XMPP integration layer
- Prototype Admin UI flows (Room creation, Template builder integration)
- Build system log renderer and modal

---

This concludes the requirements definition for War-Rooms-X.
The system is designed to evolve from simple structured chat into a robust training platform with structured workflows, flexible roles, and traceable history.

