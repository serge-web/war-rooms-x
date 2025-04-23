import { test, expect } from '@playwright/test'

// Example test suite
test.describe('Welcome page functionality', () => {
  test('should load the welcome', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    
    // Verify the page has loaded by checking for a common element
    // This selector should be updated to match your actual application
    await expect(page.locator('.login-card')).toBeVisible()
    // status of the the login buttons
    await expect(page.locator('.login-button')).toBeDisabled()
    await expect(page.locator('.admin-button')).toBeDisabled()
    await expect(page.locator('.mock-button')).not.toBeDisabled()
  })
})
