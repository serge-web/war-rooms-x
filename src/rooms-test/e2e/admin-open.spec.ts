import { test, expect } from '@playwright/test'

// Example test suite
test.describe('Welcome page functionality', () => {
  test('should load the welcome', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    
    // Verify the page has loaded by checking for a common element
    // This selector should be updated to match your actual application
    await expect(page.locator('.login-card')).toBeVisible()

    // check mock login enabled
    await expect(page.locator('.mock-rest-button')).not.toBeDisabled()

    await(page.locator('.mock-rest-button')).click()
    // check the welcome title is visible
    await expect(page.locator('.maintainer-welcome-title')).toBeVisible()

    // open the wargames item
    await page.getByRole('menuitem', { name: 'Wargames' }).click();

  })
})
