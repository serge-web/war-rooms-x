# End-to-End Testing with Playwright

This directory contains end-to-end tests for the War Rooms application using Playwright.

## Setup

Playwright is already configured in the project. The main configuration is in `playwright.config.ts` at the root of the project.

## Running Tests

You can run the E2E tests using the following yarn commands:

```bash
# Run all E2E tests
yarn test:e2e

# Run tests with UI mode (interactive)
yarn test:e2e:ui

# Run tests in debug mode
yarn test:e2e:debug
```

## Test Structure

Tests are organized in this directory (`src/rooms-test/e2e`). Each test file should focus on a specific feature or component of the application.

## Best Practices

1. Use data-testid attributes for reliable element selection
2. Keep tests independent from each other
3. Mock external services when appropriate
4. Follow the test strategy (15% of test effort dedicated to E2E tests)
5. Focus on critical user flows and high-value scenarios

## Writing Tests

Example of a basic test:

```typescript
import { test, expect } from '@playwright/test'

test('user can log in', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="username"]', 'testuser')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login-button"]')
  
  // Assert that login was successful
  await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()
})
```

## Debugging

When tests fail, you can:

1. Use `test:e2e:debug` to run tests in debug mode
2. Check the HTML snapshot and screenshots in the test-results directory
3. Use `page.pause()` in your test to pause execution and inspect the state

## CI Integration

Tests are configured to run differently in CI environments. The configuration automatically adjusts settings like retries and parallelism when running in CI.
