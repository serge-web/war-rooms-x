# 🛣️ War-Rooms-X: Implementation Roadmap

This roadmap outlines the phased development plan for the War-Rooms-X distributed wargaming platform.

---

## 🧩 Phase 0: Project Initialization

**Goals:**
- Establish foundational structure
- Prepare infrastructure for development and testing

**Tasks:**
- [ ] Set up project structure with standard monolith architecture using `yarn`
- [ ] Scaffold Player and Admin pages (React + Tailwind + React Router)
- [ ] Deploy local OpenFire server:
  - REST API plugin
  - PubSub and MUC support
- [ ] Create service and utility modules:
  - `services/xmpp` (StanzaJS wrapper)
  - `services/openfire` (admin API wrapper)
  - `schema` (template metadata + game models)

**Deliverables:**
- Project structure in version control
- Local dev instance with mock users and rooms

---

## 🚀 Phase 1: Core Login + Game State

**Goals:**
- Enable secure login
- Display core game state

**Tasks:**
- [ ] Implement login UI and auth flow (XMPP credentials)
- [ ] Create `useWargame()` hook
- [ ] Display game turn, phase, and date in right-hand panel
- [ ] Log login events to `__system_log`

**Deliverables:**
- Working login screen
- Live game state display
- Logged-in player banner

---

## 💬 Phase 2: Room Interaction + Messaging

**Goals:**
- Join and interact with rooms
- Send and receive plain messages

**Tasks:**
- [ ] Implement `useRooms()` and `useRoom()` hooks
- [ ] Show tabs using FlexLayout
- [ ] Enable message sending and live updates
- [ ] Integrate read/unread indicators (local state)
- [ ] Add optimistic message posting
- [ ] Hide `__system_*` rooms from UI

**Deliverables:**
- Functional chat experience
- Support for multi-room layout
- Read filtering

---

## 📄 Phase 3: Structured Messaging

**Goals:**
- Support structured communication via JSON templates

**Tasks:**
- [ ] Build `templates` collection in PubSub
- [ ] Implement `useTemplates()` and `useTemplate()` hooks
- [ ] Integrate RJSF for structured message UI
- [ ] Render structured messages in outline form
- [ ] Restrict message templates by room/role/phase

**Deliverables:**
- Form-based message input
- Template-specific rendering in chat history

---

## 🧑‍⚖️ Phase 4: Game Control & Admin Tools

**Goals:**
- Enable umpires to configure and control exercises

**Tasks:**
- [ ] Scaffold Admin UI with react-admin
- [ ] Add flows for:
  - Game metadata config
  - Force + player creation
  - Room setup and permissions
- [ ] Add turn advancement controls for Game Control
- [ ] Log system events to `__system_log`

**Deliverables:**
- Game design and management panels
- Turn control + state sync

---

## 📥 Phase 5: Backup, Restore, and Export

**Goals:**
- Enable scenario cloning and historical review

**Tasks:**
- [ ] Backup/Restore UI (local JSON)
- [ ] Export message logs (JSON by room/turn)
- [ ] Store version metadata
- [ ] Add \"View System Log\" modal for White force

**Deliverables:**
- Downloadable backup files
- Post-game analysis support

---

## 🧪 Phase 6: Testing & Simulation

**Goals:**
- Support dev testing and repeatability

**Tasks:**
- [ ] Create a simulation/testing app
- [ ] Add mock XMPP + REST test harness
- [ ] Write unit tests for all hooks
- [ ] Add utility functions for room + template setup

**Deliverables:**
- Testable hooks
- Simulated player experience

---

## 🏁 Phase 7: Polish & Extensions

**Goals:**
- Final refinements, UX polish, and future support

**Tasks:**
- [ ] Add tooltip info to room tabs
- [ ] Polish unread message indicators
- [ ] Add support for structured message parameterization
- [ ] Enable image/file attachments (future)
- [ ] Document hook APIs and message schemas

**Deliverables:**
- Production-ready release
- Dev + user documentation