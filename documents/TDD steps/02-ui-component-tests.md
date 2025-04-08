# 2. UI Component Tests

## 2.1 Skeleton application

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that the application has a skeleton UI.  It should open with a login screen. Mock the actual login process, but let clicking the Login button navigate directly to the player view. Verify that the UI matches the specifications in files in the `documents` folder. Use jest-dom for assertions.

You will need to work hard to get the layout correct for the player view.  The general app layout is in the image at `documents/basic-layout.png`. The right-hand set of components should be called `ControlPanel`, and be of fixed width (300px), and be full-height in the browser window..  The top panel will be called `GameState` and will be of fixed height: 120px.  The middle panel will be called `UserDetails` and will be of fixed height: 100px.  The central panel will be called `AdminMessages` and will consume the remaining height.

The left-hand set of components should be called `RoomsPanel`, and will consume the remaining width, and be full-height in the browser window. 

These components can just be placeholders for this test - since you are concentrating on getting the layout correct.

You are having trouble solving this issue.  For now, just create a PlayerView component that matches the design image.  It should use an `antd` Layout component - and just include colored divs as placeholders for the components that will later be inserted.

## 2.2 Player view

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each component (RoomTab, MessageBubble, MessageInputForm, etc.) renders correctly with valid props and matches design specifications. Note the requirement to use FluidLayout when displaying the rooms for this player.  Introduce a mock data object that can be used to populate the rooms. Use jest-dom for assertions.

## 2.3 Game State Component.

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on implementing the GameState component.  The files in the `Documents` folder will explain what it should display.  Create a MockGameState file that can be used to populate the game state. Use jest-dom for assertions. The component should show:
- turn number
- current time
- current phase

## 2.4 UserDetails Component.

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on implementing the UserDetails component.  The files in the `Documents` folder will explain what it should display.  Create a MockUserDetails file that can be used to populate the game state. Use jest-dom for assertions. The component should show:
- Force Name
- Player Role

## 2.5 AdminMessages Component.

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on implementing the UserD component.  The files in the `Documents` folder will explain what it should display.  Create a MockGameState file that can be used to populate the game state. Use jest-dom for assertions. The component should show:
- turn number
- current time
- current phase

## 2.6  Component Rendering

As a Frontend Test Engineer, specializing in React Testing Library, it is your goal to write unit tests for component rendering in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that each component (RoomTab, MessageBubble, MessageInputForm, etc.) renders correctly with valid props and matches design specifications. Use jest-dom for assertions.

## 2.7 Component States

As a UI Testing Specialist, specializing in React component testing, it is your goal to write unit tests for component states in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that components render appropriate UI for different states (loading, error, empty) when those states occur.

## 2.6 Component Interactions

As a Frontend Developer, specializing in React event handling, it is your goal to write unit tests for component interactions in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that components respond appropriately to user interactions (click/type/submit) and trigger the correct handlers/callbacks.
