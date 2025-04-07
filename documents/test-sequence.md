1. Reach Hooks Tests
1.1 Hook Initialisation. 

As a Senior React Developer, specializing in React Hooks and TypeScript, it is your goal to write unit tests for hook initialization in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each hook (useWargame, useRooms, useRoom, useForce, usePlayer, useTemplates) initializes with default state and subscribes to appropriate XMPP events/nodes. Use @testing-library/react-hooks for testing hooks in isolation.

1.2 State Updates.

As a React Testing Specialist, specializing in React Hooks and state management, it is your goal to write unit tests for hook state updates in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each hook correctly updates its state when XMPP events are received and triggers re-renders with new data. Mock the XMPP client to simulate events.

1.3. Error Handling.

As a Test-Driven Development Expert, specializing in error handling and React Hooks, it is your goal to write unit tests for hook error handling in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each hook gracefully handles errors (network, parsing, etc.) and provides appropriate error state to components.


2. UI Component Tests
2.1. Component Rendering.

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each component (RoomTab, MessageBubble, MessageInputForm, etc.) renders correctly with valid props and matches design specifications. Use jest-dom for assertions.

2.2. Component States.

As a UI Testing Specialist, specializing in React component testing, it is your goal to write unit tests for component states in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that components render appropriate UI for different states (loading, error, empty) when those states occur.

2.3. Component Interactions.

As a Frontend Developer, specializing in React event handling, it is your goal to write unit tests for component interactions in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that components respond appropriately to user interactions (click/type/submit) and trigger the correct handlers/callbacks.

3. Authentication & Authorization Tests

3.1. Valid Login

As a Security Testing Expert, specializing in authentication workflows, it is your goal to write unit tests for valid login scenarios in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with valid credentials are authenticated, redirected to the appropriate view based on their role, and their presence is logged in __system_log.

3.2. Invalid Login

As a Security Engineer, specializing in authentication edge cases, it is your goal to write unit tests for invalid login scenarios in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with invalid credentials see an error message and remain on the login page.

3.3. Role-based Access Control
As an Authorization Specialist, specializing in role-based access control, it is your goal to write unit tests for RBAC in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with specific roles only see rooms they have access to and only have write permissions according to their role and current game phase.

4. Messaging Tests
4.1. Plain Text Messaging

As a Messaging Systems Developer, specializing in real-time communication, it is your goal to write integration tests for plain text messaging in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users in rooms with write permissions can send plain text messages that are delivered to all room participants and displayed with correct sender information and timestamp. Use MSW to mock XMPP.

4.2. Structured Messaging
As a Data Structures Engineer, specializing in structured messaging, it is your goal to write integration tests for structured messaging in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with assigned templates can fill and submit template forms, creating structured messages that are delivered to all room participants and rendered as collapsible outlines.

4.3 Message Permissions

As a Permissions Testing Specialist, specializing in access control, it is your goal to write integration tests for message permissions in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users in rooms without write permissions for the current phase cannot send messages, with the UI preventing submission and displaying appropriate feedback.

5. Game State Management Tests
5.1. Game State Synchronization

As a State Management Expert, specializing in real-time synchronization, it is your goal to write integration tests for game state synchronization in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that when Game Control advances the turn/phase, all clients receive the updated state, UI updates accordingly, and room permissions adjust based on the new phase.

5.2. Game State Persistence

As a Data Persistence Engineer, specializing in state recovery, it is your goal to write integration tests for game state persistence in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that when users refresh their browsers and reconnect, they see the current game state and have access to message history.

6. Admin Functionality Tests
6.1. Wargame Setup

As an Admin Systems Developer, specializing in configuration management, it is your goal to write E2E tests for wargame setup in the War-Rooms-X application. You will write the test first, then execute 'yarn playwright test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that admin users can configure new wargames, with configurations saved to PubSub and accessible to all clients. Use Playwright for E2E testing.

6.2. Force and Player Management
As a User Management Specialist, specializing in role assignment, it is your goal to write E2E tests for force and player management in the War-Rooms-X application. You will write the test first, then execute 'yarn playwright test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that admin users can create forces and assign players, with appropriate XMPP users and groups created, and players able to login with assigned credentials.

6.3. Room Configuration
As a System Configuration Expert, specializing in multi-user environments, it is your goal to write E2E tests for room configuration in the War-Rooms-X application. You will write the test first, then execute 'yarn playwright test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that admin users can create and configure rooms, with MUC rooms created with correct permissions and visible to assigned players.