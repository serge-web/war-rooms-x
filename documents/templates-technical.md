# Technical Overview – Structured Messaging Feature (Updated with Room Type Factory)

## 1. Overview

This document outlines the technical design for implementing the **Structured Messaging** feature in the War-Rooms-X system. It reflects the use of a **Room Type Factory + Strategy Pattern**, which modularizes room-specific behavior and supports future extensibility.

---

## 2. Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | ReactJS, TypeScript, react-admin, MUI/Ant Design, react-jsonschema-form |
| **Backend (Mock)** | In-memory JavaScript store |
| **Backend (Live)** | OpenFire XMPP with MUC and PubSub |
| **Messaging Protocol** | XMPP (via standard MUC chat messages) |
| **Forms** | react-jsonschema-form + react-json-schema-form-builder |

---

## 3. Room Type Strategy Pattern

The system introduces a **RoomTypeFactory** that manages multiple `RoomTypeStrategy` implementations.

### Strategy Interface (`RoomTypeStrategy<T>`)

Each strategy provides:
- `id`: Room type identifier (`e.g. "structured"`)
- `label`: Human-friendly label for Admin UI
- `isConfigValid(config: any)`: Runtime validator/type guard
- `renderShow(config: T)`: Show page UI for admin
- `renderEdit(config: T, onChange: (T) => void)`: Edit page UI

### Factory Capabilities
- Register and manage strategies
- Lookup and delegate rendering/config parsing based on `room.description.type`
- Used in Admin UI to drive form logic for each room type

---

## 4. Project Structure Additions

### `/src/roomTypes/`

```txt
roomTypes/
├── RoomTypeStrategy.ts           # Shared interface
├── RoomTypeFactory.ts            # Strategy registry singleton
├── StructuredMessagingStrategy.tsx
├── index.ts                      # Registers strategies
```

---

## 5. Structured Messaging Implementation

| Component | Responsibility |
|----------|----------------|
| `StructuredMessageForm.tsx` | Renders the selected RJSF form for message submission |
| `StructuredMessageViewer.tsx` | Renders the submitted message (MVP: raw JSON) |
| `TemplateSelector.tsx` | UI to choose from available templates |
| `useStructuredTemplates.ts` | Fetches templates for the current room |
| `renderStructuredMessage.ts` | (Planned) Renderer to display JSON form data as readable label-value pairs |

---

## 6. XMPP Message Format

Each structured message is sent as a standard XMPP MUC message, with:

```ts
body: JSON.stringify(formData),
details: {
  templateId: "template-xyz"
}
```

Templates are not embedded in the message. They are referenced by `templateId` and used for audit or future rendering enhancements.

---

## 7. Admin Integration

- Room type field added to room creation/edit screen
- On `Show` and `Edit` pages, the system uses the factory to render room-specific UI for metadata/config
- Template association for structured messaging uses a dropdown (populated via `templates` resource)

---

## 8. Future-Proofing

| Area | Notes |
|------|-------|
| Room Types | Add new types via new strategies, no core changes needed |
| Role-based Access | Planned via per-room or per-template role rules |
| Message Rendering | Plan to use custom JSON walker or read-only RJSF renderer |
| Form Validation | Async validation or dependent field logic may be added |

---

## 9. Testing Strategy

- Unit test each strategy’s `renderShow`, `renderEdit`, and `isConfigValid`
- Integration test form submission and message creation
- Snapshot test message rendering (raw and future pretty view)
- E2E test Admin UI flows for room creation/editing