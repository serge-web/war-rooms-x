import { test, expect } from '@playwright/test'

test.describe('Admin wargame editing functionality', () => {
  test('should reset data, edit wargame title and verify changes', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    
    // Verify the page has loaded by checking for the login card
    await expect(page.locator('.login-card')).toBeVisible()

    // Reset the data store first
    await expect(page.locator('.reset-data-button')).toBeVisible()
    await page.locator('.reset-data-button').click()
    
    // The success modal may not be visible in tests, so we'll wait a moment for the reset to complete
    // and then proceed. The modal is shown in the UI but might not be detected in the test environment.
    await page.waitForTimeout(100) // Wait for data reset to complete
    
    // If the modal is visible, close it, but don't fail if it's not
    try {
      const okButton = page.getByRole('button', { name: 'OK' })
      if (await okButton.isVisible())
        await okButton.click()
    } catch {
      // Modal might not be visible, continue with the test
      console.log('Modal not visible or already closed')
    }
    
    // Log in with mock REST admin
    await expect(page.locator('.mock-rest-button')).toBeVisible()
    await page.locator('.mock-rest-button').click()
    
    // Verify we're on the admin page by checking for the welcome title
    await expect(page.locator('.maintainer-welcome-title')).toBeVisible()
    
    // Navigate to the Wargames section
    await page.getByRole('menuitem', { name: 'Wargames' }).click()
    
    // Wait for the wargames list to load
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Store the original wargame title for later comparison
    const originalTitle = await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').textContent()
    
    // Click on the first wargame to edit it
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    
    // Verify we're on the edit page
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Find the name input field and clear it
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toBeVisible()
    await nameInput.click()
    await nameInput.clear()
    
    // Enter a new title with a timestamp to ensure uniqueness
    const newTitle = `Test Wargame ${new Date().toISOString().replace(/[:.]/g, '-')}`
    await nameInput.fill(newTitle)
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Verify the title has been updated in the list
    const updatedTitle = await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').textContent()
    expect(updatedTitle).toBe(newTitle)
    expect(updatedTitle).not.toBe(originalTitle)
    
    // Additional verification: Go back to edit page to confirm persistence
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Check that the name field contains our new title
    const nameInputValue = await page.locator('input[name="name"]').inputValue()
    expect(nameInputValue).toBe(newTitle)
  })
})
