# War-Rooms-X: User Flows Document

This document outlines key user flows for the War-Rooms-X distributed wargaming application. Flows are divided by role and cover the major interactions with the system, including login, room usage, admin tasks, and structured messaging.

---

## 🔐 Login Flow (All Users)
1. User navigates to the application URL.
2. Welcome page is shown with:
   - Username/password fields
   - "Join" button
   - Less prominent "Maintain" button for admin access
   - Welcome info loaded from public XMPP metadata
3. User enters credentials and clicks "Join"
4. System authenticates against OpenFire
5. On success:
   - Player UI is loaded
   - Player banner shows their name, force, and icon
   - `__system_log` is updated: "[ROLE] has joined the game"

---

## 🧑‍🚀 Player Flow: Room Interaction
1. Upon login, player sees:
   - Right-hand panel with game state and "Admin" room
   - Main panel showing MUC rooms (stacked or arranged via FlexLayout)
2. Each room tab displays:
   - Room name + info icon (hover shows description)
   - Message history (newest at bottom)
   - Input area (plain or structured, based on config)
3. Player can:
   - Read messages
   - Post messages (if allowed in current phase)
   - Mark messages as read/unread (if enabled)
   - Filter: Show all / Unread only
   - Use dropdown to select a structured template (if assigned)
4. Messages are rendered with:
   - Timestamp, sender, role, force
   - Plain or structured content
   - Optional color tags/badges by force

---

## 🧑‍⚖️ Game Control Flow: Advance Turn
1. Game Control sees "Next" button at top of game state panel
2. On click:
   - Turn/Phase advances according to game model
   - PubSub broadcast updates all clients
   - `__system_log` updated with new turn event
   - Room permissions automatically adjusted based on phase

---

## 🛠️ Admin Flow: Wargame Setup
1. Admin clicks "Maintain" from welcome screen
2. Logs in as OpenFire admin
3. Opens Wargame Setup panel
4. Fills out:
   - Name, description
   - Start date/time
   - Game interval (e.g., P2DT6H)
   - Turn and phase model
5. Saves metadata to PubSub

---

## 🛠️ Admin Flow: Create Forces and Players
1. Admin opens Forces panel
2. Adds forces with name, optional icon (PNG)
3. Opens Players panel
4. Adds players:
   - Name, role, force, username, password
5. Players are stored in OpenFire and linked to groups

---

## 🛠️ Admin Flow: Create and Configure Rooms
1. Admin opens Rooms panel
2. Clicks "Create Room"
3. Enters:
   - Name, description
   - Adds forces/players
   - Sets write access by phase
   - Assigns structured templates by role/force/phase (optional)
4. Saves configuration (stored in PubSub + OpenFire)
5. (Optional) Clone existing room for similar setup

---

## 🛠️ Admin Flow: Template Management
1. Admin opens Templates panel
2. Creates new template using JSON Schema form builder
3. Previews with RJSF
4. Saves to PubSub under `templates` collection
5. Returns to Room panel to assign templates

---

## 💾 Admin Flow: Backup and Restore Metadata
### Backup:
1. Admin clicks "Export Wargame Metadata"
2. Enters version details (e.g., "v1.1 Logistics Scenario")
3. Downloads JSON backup (stored locally)

### Restore:
1. Admin clicks "Restore Wargame Metadata"
2. Uploads backup file
3. System rebuilds setup from file (no messages/passwords included)

---

## 📤 Admin Flow: Export Message History
1. Admin navigates to Export panel
2. Selects:
   - Rooms (or all)
   - Turn/phase filters (optional)
3. Clicks "Export"
4. JSON file is downloaded with:
   - Room, timestamp, sender, game state, message content

---

## 🔑 Admin Flow: Reset Passwords
1. Admin opens Players panel
2. Finds player
3. Clicks "Reset Password"
4. Enters new password
5. Password is updated via REST
6. `__system_log` entry is created: "Password for [ROLE] reset by Game Control"

---

## 👁️ Observer Flow: View Audit Log
1. Observer (White force) clicks "View System Log"
2. Modal popup opens
3. Displays entries from `__system_log`
4. Can scroll or filter log (future)

---

## 🔁 Developer Flow: Hook Usage
- `useWargame()` – load game metadata and state after login
- `useRooms()` – list accessible rooms
- `useRoom(roomId)` – read messages, post (plain/structured), manage read state
- `useForce()` – get current player’s force
- `useForces()` – see all forces (name + icon)
- `usePlayer()` – access player metadata
- `useTemplates()` – load all templates assigned to current player/rooms
- `useTemplate(id)` – fetch a single template by ID

---

## ✅ Optional/Advanced Flows
- Bulk "Mark All Read" in a room
- Toggle message filter: All / Unread
- Support structured message preview and version tracking
- Structured message export for AAR

---

This concludes the defined user flows for War-Rooms-X.

