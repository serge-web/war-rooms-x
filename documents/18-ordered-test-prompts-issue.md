# Ordered Test Prompts for Issue #18: Add `Wargame` Resource to React-Admin Pages

This document provides an ordered sequence of tests for implementing the Wargame resource in React-Admin, with each test designed to be developed in isolation. Each prompt is crafted for an AI agent to implement the test following best practices.

## Test Implementation Sequence

### Phase 1: Type Definitions and Mappers

#### Test 1: Wargame Type Definitions

```
As a TypeScript Developer, specializing in React and TypeScript type systems, it is your goal to write unit tests for the Wargame type definitions. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files, and ensure all types are properly exported.

Your test should verify:
1. The XWargame interface has the correct properties and state fields
2. The RWargame interface has a flattened structure with all required fields
3. Both interfaces are properly exported

Remember these are type-checking tests only, so no runtime assertions are needed.
```

#### Test 2: Wargame Mapper Functions (XtoR)

```
As a TypeScript Developer, specializing in React and data transformation, it is your goal to write unit tests for the Wargame XtoR mapper function. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The wargameXtoR function correctly converts from XWargame to RWargame format
2. The function handles all properties correctly, including nested ones
3. The function handles edge cases like empty arrays in phaseModel

Use Jest and follow the Given-When-Then pattern in your test structure.
```

#### Test 3: Wargame Mapper Functions (RtoX)

```
As a TypeScript Developer, specializing in React and data transformation, it is your goal to write unit tests for the Wargame RtoX mapper function. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The wargameRtoX function correctly converts from RWargame to XWargame format
2. The function properly separates properties and state fields
3. The function handles all properties correctly, including arrays

Use Jest and follow the Given-When-Then pattern in your test structure.
```

### Phase 2: Data Provider Implementation

#### Test 4: Data Provider getList Method

```
As a React Developer, specializing in React-Admin and data providers, it is your goal to write unit tests for the Wargame data provider's getList method. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The getList method fetches data from both game-properties and game-state PubSub nodes
2. The method combines the data correctly into the RWargame format
3. The method handles errors appropriately when fetching fails

Use Jest with mock functions to simulate the PubSub client behavior.
```

#### Test 5: Data Provider getOne Method

```
As a React Developer, specializing in React-Admin and data providers, it is your goal to write unit tests for the Wargame data provider's getOne method. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The getOne method fetches data for a specific wargame by ID
2. The method combines data from both game-properties and game-state nodes
3. The method handles errors appropriately

Use Jest with mock functions to simulate the PubSub client behavior.
```

#### Test 6: Data Provider update Method

```
As a React Developer, specializing in React-Admin and data providers, it is your goal to write unit tests for the Wargame data provider's update method. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The update method correctly publishes changes to both game-properties and game-state nodes
2. The method separates the data correctly using the RtoX mapper
3. The method handles errors appropriately when publishing fails
4. The method returns the updated data in the correct format

Use Jest with mock functions to simulate the PubSub client behavior.
```

#### Test 7: Data Provider create Method

```
As a React Developer, specializing in React-Admin and data providers, it is your goal to write unit tests for the Wargame data provider's create method. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The create method correctly publishes new data to both game-properties and game-state nodes
2. The method separates the data correctly using the RtoX mapper
3. The method handles errors appropriately
4. The method returns the created data with an ID in the correct format

Use Jest with mock functions to simulate the PubSub client behavior.
```

### Phase 3: PubSub Integration

#### Test 8: PubSub Integration for Fetching Wargame Data

```
As a React Developer, specializing in XMPP and PubSub systems, it is your goal to write integration tests for fetching Wargame data from PubSub nodes. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The PubSub service correctly fetches data from game-properties and game-state nodes
2. The service combines the data correctly into the XWargame format
3. The service handles network errors gracefully

Use Jest with MSW (Mock Service Worker) to mock the XMPP client and PubSub responses.
```

#### Test 9: PubSub Integration for Updating Wargame Properties

```
As a React Developer, specializing in XMPP and PubSub systems, it is your goal to write integration tests for updating Wargame properties via PubSub. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The PubSub service correctly publishes updates to the game-properties node
2. The service formats the data correctly before publishing
3. The service handles network errors gracefully

Use Jest with MSW (Mock Service Worker) to mock the XMPP client and PubSub responses.
```

#### Test 10: PubSub Integration for Updating Wargame State

```
As a React Developer, specializing in XMPP and PubSub systems, it is your goal to write integration tests for updating Wargame state via PubSub. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The PubSub service correctly publishes updates to the game-state node
2. The service formats the data correctly before publishing
3. The service handles network errors gracefully

Use Jest with MSW (Mock Service Worker) to mock the XMPP client and PubSub responses.
```

### Phase 4: React-Admin Integration

#### Test 11: Data Provider with React-Admin List Component

```
As a React Developer, specializing in React-Admin and component integration, it is your goal to write integration tests for the Wargame data provider with React-Admin's List component. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The data provider correctly loads wargame data in the List component
2. The component displays the data correctly
3. The component handles loading and error states appropriately

Use React Testing Library with a mock data provider to test the component integration.
```

#### Test 12: Data Provider with React-Admin Edit Component

```
As a React Developer, specializing in React-Admin and component integration, it is your goal to write integration tests for the Wargame data provider with React-Admin's Edit component. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The data provider correctly loads wargame data in the Edit component
2. The component displays the data correctly in form fields
3. The component submits updates correctly through the data provider
4. The component handles loading and error states appropriately

Use React Testing Library with a mock data provider to test the component integration.
```

### Phase 5: UI Component Tests

#### Test 13: WargameList Component Rendering

```
As a React Developer, specializing in React-Admin and UI components, it is your goal to write unit tests for the WargameList component. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component renders with the correct column headers
2. The component displays data correctly
3. The component includes edit buttons for each row
4. The component handles empty data appropriately

Use React Testing Library to test the component rendering and interactions.
```

#### Test 14: WargameList Component Filtering

```
As a React Developer, specializing in React-Admin and UI components, it is your goal to write unit tests for the WargameList component's filtering functionality. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component renders filter inputs correctly
2. The component applies filters correctly when submitted
3. The component calls the data provider with the correct filter parameters
4. The component displays filtered results correctly

Use React Testing Library to test the component rendering and interactions.
```

#### Test 15: WargameEdit Component Rendering

```
As a React Developer, specializing in React-Admin and UI components, it is your goal to write unit tests for the WargameEdit component. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component renders all form fields with correct values
2. The component handles loading state appropriately
3. The component displays validation errors correctly
4. The component includes a submit button

Use React Testing Library to test the component rendering and interactions.
```

#### Test 16: WargameEdit Component Form Validation

```
As a React Developer, specializing in React-Admin and form validation, it is your goal to write unit tests for the WargameEdit component's form validation. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component validates required fields correctly
2. The component displays validation error messages
3. The component prevents submission when validation fails
4. The component allows submission when validation passes

Use React Testing Library to test the component validation behavior.
```

#### Test 17: WargameEdit Component Array Input Handling

```
As a React Developer, specializing in React-Admin and complex form inputs, it is your goal to write unit tests for the WargameEdit component's array input handling. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component renders array inputs (phaseModel) correctly
2. The component allows adding new items to the array
3. The component allows removing items from the array
4. The component submits the array data correctly

Use React Testing Library to test the component array input behavior.
```

#### Test 18: WargameCreate Component Rendering

```
As a React Developer, specializing in React-Admin and UI components, it is your goal to write unit tests for the WargameCreate component. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component renders with empty form fields
2. The component includes all required input fields
3. The component handles loading state appropriately
4. The component includes a submit button

Use React Testing Library to test the component rendering and interactions.
```

#### Test 19: WargameCreate Component Default Values

```
As a React Developer, specializing in React-Admin and form handling, it is your goal to write unit tests for the WargameCreate component's default values. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The component provides default values for optional fields
2. The component submits with default values when not explicitly set
3. The component correctly combines user input with default values
4. The component validates the form before submission

Use React Testing Library to test the component default value behavior.
```

### Phase 6: Error Handling Tests

#### Test 20: PubSub Fetch Error Handling

```
As a React Developer, specializing in error handling and resilient applications, it is your goal to write tests for PubSub fetch error handling. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The application displays error notifications when PubSub fetches fail
2. The error messages are user-friendly and informative
3. The UI components handle the error state appropriately
4. The application provides recovery options where appropriate

Use React Testing Library and mock error responses to test the error handling behavior.
```

#### Test 21: Network Error Handling During Save Operations

```
As a React Developer, specializing in error handling and resilient applications, it is your goal to write tests for network error handling during save operations. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The application displays error notifications when save operations fail
2. The error messages are user-friendly and informative
3. The form remains in an editable state after a save error
4. The application preserves user input after a save error

Use React Testing Library and mock error responses to test the error handling behavior.
```

#### Test 22: Malformed PubSub Data Handling

```
As a React Developer, specializing in data validation and error handling, it is your goal to write tests for handling malformed PubSub data. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes. Use single quotes for strings, no trailing semi-colons in TypeScript files.

Your test should verify:
1. The application handles null or undefined PubSub data gracefully
2. The application validates PubSub data structure before processing
3. The application displays appropriate error messages for malformed data
4. The UI components handle the error state appropriately

Use Jest with mock functions to simulate malformed PubSub responses.
```

### Phase 7: End-to-End Tests

#### Test 23: E2E Wargame List Navigation and Display

```
As a QA Engineer, specializing in E2E testing and Playwright, it is your goal to write end-to-end tests for navigating to the wargame list and displaying data. You will write the test first, then execute 'yarn test:e2e' and continue to fix errors until the test passes. You will follow best practices for E2E testing, including proper setup and teardown.

Your test should verify:
1. A logged-in admin user can navigate to the wargame list
2. The list displays wargame data correctly
3. The list includes expected columns and actions
4. The navigation and rendering perform within acceptable time limits

Use Playwright to automate browser interactions and assertions.
```

#### Test 24: E2E Wargame Editing and Saving

```
As a QA Engineer, specializing in E2E testing and Playwright, it is your goal to write end-to-end tests for editing a wargame and saving changes. You will write the test first, then execute 'yarn test:e2e' and continue to fix errors until the test passes. You will follow best practices for E2E testing, including proper setup and teardown.

Your test should verify:
1. A logged-in admin user can navigate to the wargame edit page
2. The form loads with existing wargame data
3. The user can update fields and save changes
4. The application redirects to the list and displays updated data after saving

Use Playwright to automate browser interactions and assertions.
```

#### Test 25: E2E Form Validation

```
As a QA Engineer, specializing in E2E testing and Playwright, it is your goal to write end-to-end tests for form validation in the wargame edit page. You will write the test first, then execute 'yarn test:e2e' and continue to fix errors until the test passes. You will follow best practices for E2E testing, including proper setup and teardown.

Your test should verify:
1. The form displays validation errors for empty required fields
2. The form prevents submission when validation fails
3. The form remains on the edit page after validation failure
4. The validation error messages are visible and informative

Use Playwright to automate browser interactions and assertions.
```

## Test Coverage Goals

| Component | Coverage Target | Priority Areas |
|-----------|----------------|----------------|
| Type Definitions | 100% | Ensure all properties are correctly defined |
| Mapper Functions | 100% | Test all edge cases and data transformations |
| Data Provider | 90% | Focus on error handling and edge cases |
| PubSub Integration | 85% | Test network errors and data validation |
| UI Components | 85% | Test form validation and user interactions |
| End-to-End | 80% | Cover critical user flows |
