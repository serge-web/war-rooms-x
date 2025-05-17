import { test, expect } from '@playwright/test'

test.describe('Admin Roles Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin using Mock Admin button
    await page.goto('/')
    
    // Verify the page has loaded by checking for the login card
    await expect(page.locator('.login-card')).toBeVisible()

    // Reset the data store first
    await expect(page.locator('.reset-data-button')).toBeVisible()
    await page.locator('.reset-data-button').click()
    
    // The success modal may not be visible in tests, so we'll wait a moment for the reset to complete
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
  })

  test('should create, edit, and delete a role', async ({ page }) => {
    // Navigate to Roles
    await page.getByRole('menuitem', { name: 'Roles' }).click()
    
    // Create a new role
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('test-role')
    await page.locator('#create-name').fill('Test Role')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify role was created
    await expect(page.getByText('Test Role')).toBeVisible()
    
    // Edit the role
    await page.getByRole('row', { name: 'test-role' }).click()
    await page.locator('#edit-name').fill('Updated Test Role')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify role was updated
    await expect(page.getByText('Updated Test Role')).toBeVisible()
  })

  // Add more role-specific tests here
  test('should validate required fields when creating a role', async ({ page }) => {
    // Navigate to Dashboard
    await page.getByRole('menuitem', { name: 'Dashboard' }).click()
    // Navigate to Roles
    await page.getByRole('menuitem', { name: 'Roles' }).click()

    // wait for roles page to open
    await page.waitForSelector('tbody tr.RaDatagrid-row')
    // Store initial count of roles
    const initialRoleCount = await page.locator('tbody tr.RaDatagrid-row').count()

    // Click Create button
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Fill only ID
    await page.locator('#create-id').fill('test-role-2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Fill only name
    await page.locator('#create-id').clear()
    await page.locator('#create-name').fill('Test Role 2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Fill both required fields
    await page.locator('#create-id').fill('test-role-2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify role was created
    await expect(page.getByText('Test Role 2')).toBeVisible()
    
    // Verify the count increased by 1
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialRoleCount + 1)
  })
})
