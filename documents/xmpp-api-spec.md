# War-Rooms-X: API Contract Specification

This document defines the REST API contract used by War-Rooms-X to interface with the OpenFire XMPP server via its Admin REST API plugin. It outlines endpoints used for user, group, and room management by the Admin UI (Game Control).

---

## 🧩 Overview
- **API Base URL**: `http(s)://<openfire-host>:9090/plugins/restapi/v1`
- **Authentication**: HTTP Basic Auth using OpenFire admin credentials
- **Format**: All requests and responses use JSON
- **Used By**: `admin-ui`, `openfire-rest` package

---

## 📘 Endpoints

### 🔐 Authentication
Handled by HTTP Basic Auth header. No separate login endpoint is used.

---

### 👥 Users (Players)

#### `GET /users`
- Fetch all users
- Optional filters: `search`, `start`, `limit`

#### `GET /users/{username}`
- Fetch a single user by username

#### `POST /users`
- Create a new user
```json
{
  "username": "blue_co",
  "password": "secure123",
  "name": "Blue CO",
  "email": ""
}
```

#### `PUT /users/{username}`
- Update user fields (e.g., password)
```json
{
  "password": "newPass2025"
}
```

#### `DELETE /users/{username}`
- Remove a user from the system

---

### 🧑‍🤝‍🧑 Groups (Forces)

#### `GET /groups`
- Fetch all groups (forces)

#### `GET /groups/{groupname}`
- Fetch details about a group and its members

#### `POST /groups`
- Create a new group (used to represent a force)
```json
{
  "name": "Red",
  "description": "Red Force Players"
}
```

#### `POST /groups/{groupname}/members/{username}`
- Add a user to a group

#### `DELETE /groups/{groupname}/members/{username}`
- Remove a user from a group

---

### 💬 Chat Rooms (MUC)
Via OpenFire’s MUC service (`conference.<domain>`)

#### `GET /chatrooms`
- List all MUC rooms

#### `GET /chatrooms/{roomName}`
- Get room metadata

#### `POST /chatrooms`
- Create a new MUC room
```json
{
  "roomName": "blue_planning",
  "naturalName": "Blue Planning Room",
  "description": "Internal comms for Blue team",
  "maxUsers": 50,
  "persistent": true,
  "publicRoom": false
}
```

#### `PUT /chatrooms/{roomName}`
- Update room metadata

#### `POST /chatrooms/{roomName}/members/{username}`
- Add a user to the room as a member (participant)

#### `POST /chatrooms/{roomName}/owners/{username}`
- Add a user as a room owner (optional, usually Umpire)

---

## 📤 Example Use Cases

### 🛠️ Create a New Player
1. `POST /users` with username and password
2. `POST /groups/{force}/members/{username}` to assign to a force
3. `POST /chatrooms/_admin/members/{username}` to join the admin room
4. `POST /chatrooms/__system_log/members/{username}` to enable audit logging
5. Additional room assignments are handled via the `Room` admin flow

### 🔄 Reset Password
- `PUT /users/{username}` with new password

### ➕ Create Room with Permissions
1. `POST /chatrooms` with metadata
2. Assign members and roles via `/members/` and `/owners/` endpoints

---

## 🔐 Notes & Security
- All Admin UI interactions use server-side stored credentials for the OpenFire admin account
- Never expose admin credentials to browser clients
- Rate-limit and protect REST API port with internal firewall or reverse proxy

---

## 📝 TODO / Extensions
- Investigate plugin support for dynamic permission templates
- Consider audit logging via plugin or message to `__system_log`
- Add retry logic and error logging in `openfire-rest` wrapper

---

This contract provides the integration surface for Admin UI to control user, force, and room lifecycles in War-Rooms-X.

