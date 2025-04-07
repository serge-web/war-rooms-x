# War-Rooms-X: Technical Overview

This document outlines the recommended technical architecture, project structure, and infrastructure stack for implementing the War-Rooms-X distributed wargaming platform, based on the previously defined requirements and user flows.

---

## 🧱 Project Structure (Monolith)
Use a standard monolith structure to simplify the project hierarchy, with `yarn` for package management.

```
/war-rooms-x
├── src/
│   ├── components/         # UI components (chat, templates, etc)
│   │   └── [ComponentName]/  # Each component with its own folder
│   │       ├── index.tsx     # Component implementation
│   │       ├── hooks.ts      # Component-specific hooks
│   │       └── tests/        # Component tests
│   ├── hooks/              # Shared React hooks (e.g., useRoom, useWargame)
│   ├── pages/              # Application pages/routes
│   │   ├── player/         # Player UI pages
│   │   └── admin/          # Admin UI pages
│   ├── services/           # Service layer
│   │   ├── xmpp/           # XMPP integration (StanzaJS wrapper)
│   │   └── openfire/       # REST wrapper for OpenFire admin tasks
│   ├── utils/              # Utility functions
│   ├── schema/             # Shared JSON schemas and validation logic
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── scripts/                # Deployment, backup, restore
├── infra/                  # Infra-as-code (Terraform/Ansible)
└── tests/
    ├── unit/              # Unit tests
    ├── integration/       # Integration tests
    └── e2e/               # End-to-end tests with Playwright
```

---

## 🏗️ Core Technologies

### Frontend
- **Framework**: React 18+
- **UI Layer**:
  - TailwindCSS
  - shadcn/ui for standard UI
  - FlexLayout (via caplin/flexlayout-react)
- **Forms**: RJSF (React JSON Schema Form)
- **State Management**: Zustand or React Query
- **Routing**: React Router
- **Authentication**: XMPP-based, with OpenFire integration

### Admin UI
- **Framework**: react-admin
- **Auth Provider**: OpenFire Admin credentials (REST-based)
- **Template Builder**: react-json-schema-form-builder
- **Preview Engine**: RJSF with mock data injection

---

## 🔌 Backend Integration

### OpenFire (XMPP Server)
- **MUC (Multi-User Chat)**: Used for all chat rooms, including hidden system rooms
- **PubSub Nodes**:
  - Game state
  - Templates
  - Room metadata
  - Player metadata (optional)
- **Groups & Users**:
  - Forces as XMPP groups
  - Players as XMPP users
  - White force has implicit access to all rooms

### REST Admin API (OpenFire Plugin Required)
- **Player Management**: Create users, update passwords
- **Group Management**: Create/update force assignments
- **Room Management**: Assign members to MUCs

---

## 📦 React Hook Strategy

Each hook abstracts XMPP and REST logic behind declarative APIs:

| Hook               | Purpose                              |
|--------------------|--------------------------------------|
| `useWargame()`     | Subscribe to game metadata and state |
| `useRooms()`       | Fetch and cache accessible rooms     |
| `useRoom(id)`      | Subscribe to messages, send, mark read |
| `usePlayer()`      | Get logged-in player identity        |
| `useForce()`       | Player’s assigned force              |
| `useForces()`      | Read list of all forces (for UI)     |
| `useTemplates()`   | List templates assigned to player    |
| `useTemplate(id)`  | Fetch template JSON + UI schema      |

---

## 🧪 Testing & Simulation

- **Unit Tests**:
  - Test each hook in isolation (mock XMPP and REST responses)
- **Simulation**:
  - Use test-utils app to simulate player view with mock server state
- **System Testing**:
  - Integration tests can run against local OpenFire instance with preloaded metadata

---

## 🛠️ Infrastructure

### Hosting
- **Frontend**: Vercel, Netlify, or Dockerized Nginx
- **OpenFire Server**:
  - Dockerized instance
  - Persistent volume for user/group data
  - Plugin support (REST API plugin, monitoring, PubSub enhancer)

### Storage & Backups
- All backups (wargame metadata, logs) are downloaded to local client machines
- JSON files used for exports and restores

### Security
- Encrypted XMPP traffic (TLS)
- Admin endpoints protected via server-side auth only
- No user registration flows; only admin can create credentials

---

## 🔁 PubSub Document Structure (Examples)

### Game State
```json
{
  "turn": 3,
  "phase": "Adjudication",
  "game_time": "2025-06-01T10:00Z"
}
```

### Room Metadata
```json
{
  "room": "Blue RFI",
  "description": "Requests for info to Umpires",
  "write_permissions": {
    "Planning": ["Blue CO"],
    "Adjudication": []
  },
  "templates": [
    { "id": "rfi_request", "applies_to": "Blue CO", "phases": ["Planning"] }
  ]
}
```

### Template Record
```json
{
  "id": "intrep_v2",
  "name": "INTREP",
  "schema": { ... },
  "uiSchema": { ... }
}
```

---

## ✅ Development Priorities
1. Implement authentication & `useWargame()`
2. Room list + chat history via `useRooms()` and `useRoom()`
3. Admin UI for forces, players, and rooms
4. Game state PubSub sync
5. Structured messaging support
6. Audit log and `__system_log` modal for White force

---

This technical architecture supports modular development, reactive UI updates via XMPP PubSub, and scalable training workflows for modern wargaming needs.

