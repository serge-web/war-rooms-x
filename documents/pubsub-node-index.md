# War-Rooms-X: PubSub Node Index

This document outlines the PubSub nodes used by War-Rooms-X for storing and distributing game state, templates, and room metadata. These nodes are fundamental to the real-time communication and state synchronization within the application.

---

## 🧩 Overview

PubSub nodes are used to distribute data across multiple clients and keep the system synchronized. The nodes are structured around core gameplay elements like the wargame state, message templates, and room-specific configurations.

### PubSub Node Naming Convention
- Nodes are named hierarchically using slashes (e.g., `warroomsx/gamestate`)
- Node names reflect their content, such as game state, room metadata, or templates

### Example Node
```json
{
  "node": "warroomsx/gamestate",
  "payload": {
    "turn": 3,
    "phase": "Adjudication",
    "game_time": "2025-06-01T10:00Z"
  }
}

📦 Node Types

1. Game State (warroomsx/gamestate)
	•	Purpose: Track global game state (turn number, phase, date/time)
	•	Structure:
```
{
  "turn": 3,
  "phase": "Adjudication",
  "game_time": "2025-06-01T10:00Z"
}
```

2. Room Metadata (warroomsx/rooms/{roomName})
	•	Purpose: Store metadata specific to each chat room, including participants, permissions, and templates
	•	Structure:
```
{
  "room": "blue_chat",
  "description": "Internal chat for Blue team",
  "participation": [
    {
      "role": "Blue CO",
      "templates": [
        { "id": "rfi_request", "phases": ["Planning"] },
        { "id": "plain_chat", "phases": [] }
      ]
    },
    {
      "role": "Red CO",
      "templates": [
        { "id": "intrep_v2", "phases": ["Adjudication"] }
      ]
    }
  ]
}
```  

	•	Participation: A list of roles and the templates available to them, along with the phases in which they can be used
	•	Plain chat: Treated as a template type, controlling when players can write into a chat room
	•	Subscribers: Room participants (via useRoom), admin interface for room configuration

3. Templates (warroomsx/templates)
	•	Purpose: Store structured message templates for different roles and forces
	•	Structure:
```json
{
  "id": "intrep_v2",
  "name": "INTREP",
  "schema": { ... },
  "uiSchema": { ... }
}
```
	•	Subscribers: Players’ rooms (filtered by force/role/phase), admin interface for template assignment

  4. Wargame Metadata (warroomsx/wargame)
	•	Purpose: Store static metadata about the wargame (name, description, start time, and theme)
	•	Structure:
  ```
  {
  "name": "Arctic Logistics 2025",
  "description": "Simulating logistics coordination in an arctic environment",
  "start_time": "2025-06-01T09:00Z",
  "interval": "P2DT6H",
  "theme": {
    "name": "Arctic Logistics",
    "description": "Logistics operation in Arctic conditions",
    "icon": "arctic_icon.png",
    "primary_color": "#1e3a8a",
    "secondary_color": "#22c55e",
    "font": "Roboto, Arial",
    "background_music": "arctic_music.mp3",
    "phase_colors": {
      "Planning": "#d1e7ff",
      "Adjudication": "#333333"
    },
    "text_labels": {
      "Planning": "Logistics Planning",
      "Adjudication": "Supply Chain Assessment"
    }
  }
}
```
	•	Subscribers: Admin interface to configure wargame setup

🧩 Node Permissions
	•	Read/Write Access is defined based on game phase and room configuration
	•	Game Control can update global game state (via warroomsx/gamestate)
	•	Admins can modify room and template configurations
	•	Players may have restricted access based on phase/role (via room metadata)

⸻

🚦 Real-Time Updates
	•	PubSub Messages: When a node is updated (e.g., game state change, new room configuration), all subscribers are notified in real-time
	•	Message Delivery: Each message published to a node is immediately delivered to all subscribed clients to ensure synchronization
	•	Error Handling: Clients should handle potential network errors (e.g., retries on message failures) and show relevant UI feedback  

  📝 Future Enhancements
	•	Dynamic Node Creation: Consider supporting dynamic PubSub nodes for temporary or custom rooms/scenarios
	•	Versioning Support: Implement versioning for templates and room metadata to track historical changes

⸻
