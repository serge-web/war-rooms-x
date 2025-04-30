# Structured Messaging Feature - Requirements Document (Updated with Room Type Strategy Pattern)

## 1. Overview
Introduce a new room type in the War-Rooms-X application: **Structured Messaging rooms**. These rooms support structured message entry via dynamically generated forms using [RJSF](https://github.com/rjsf-team/react-jsonschema-form).

This feature is implemented as part of a scalable **room type system**, which uses a **Strategy Pattern** to define configurable behaviors for each room type (e.g., Structured Messaging, Map of Play, etc.).

---

## 2. Core Features

| Feature | Description |
|--------|-------------|
| **Structured Room Type** | A new chat room type that allows messages to be submitted via structured forms. |
| **Form Templates** | Designed by Game Designers in the Admin UI using `react-json-schema-form-builder`. |
| **Template Storage** | Templates are stored under a `templates` resource (mock backend: dataset; live: XMPP pubsub `templates` collection). |
| **Room Metadata** | Structured rooms define a list of template IDs in their `room.description` metadata (stringified JSON). |
| **Template Selection UX** | Users see a dropdown of allowed templates. If only one, it’s selected automatically. |
| **Form Submission** | Users fill out the RJSF form and submit. The form data is serialized into the message body. |
| **Message Format** | Stored as a standard XMPP MUC message. Includes `details.templateId` field for auditability. |
| **Rendering** | Initially rendered as raw JSON. Future options include: <ul><li>Custom label-value rendering</li><li>Read-only RJSF view (performance TBC)</li></ul> |
| **Admin UI** | Game Designers associate templates via dropdown in the room config (React Admin). |
| **Template Versioning** | Handled manually by the Game Designer (e.g., `V2` suffix). |
| **Access Control (Future)** | Role-based access will be supported in future iterations, allowing template-use restrictions. |

---

## 3. Room Type Strategy Pattern

To support multiple room types (e.g., Structured Messaging, Map of Play), the system uses a **Strategy Pattern**:

### Each Strategy Provides:
- `id`: Unique room type key
- `label`: Human-readable label
- `isConfigValid(config: any)`: Type guard for room config
- `renderShow(config)`: ReactElement for read-only admin view
- `renderEdit(config, onChange)`: ReactElement for editing config

### Strategy Registration
Strategies are registered with a singleton `RoomTypeFactory`, which allows:
- Lookup by `room.description.type`
- UI rendering delegation based on room type
- Easy future extensibility with new room types

---

## 4. Out of Scope (for MVP)
- Automated processing or in-game logic triggers.
- Real-time validation or schema versioning logic.
- Role-based template access control.
- Pretty rendering of structured data.