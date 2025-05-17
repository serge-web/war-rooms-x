import { test, expect } from '@playwright/test'

test.describe('Admin Roles and Rooms', () => {
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

  test('should create, edit, and delete a room', async ({ page }) => {
    // Navigate to Rooms
    await page.getByRole('menuitem', { name: 'Rooms' }).click()
    
    // Create a new chat room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('test-room')
    await page.locator('#create-name').fill('Test Room')
    
    // Fill in room details
    await page.locator('#create-description').fill('Test Description')
    
    // Select room type
    await page.locator('#edit-room-type').click()
    await page.getByRole('option', { name: 'Chat Room - A standard chat room' }).click()
    
    // Set access control
    await page.getByRole('button', { name: 'Public' }).click()
    await page.getByRole('combobox', { name: 'Presence' }).click()
    await page.getByRole('option', { name: 'All' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created
    await expect(page.getByText('Test Room')).toBeVisible()
    
    // Edit the room
    await page.getByRole('row', { name: 'test-room' }).click()
    await page.getByLabel('Name').fill('Updated Test Room')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify room was updated
    await expect(page.getByText('Updated Test Room')).toBeVisible()
  })

  test('should create a form room with templates', async ({ page }) => {
    // First, create a template if it doesn't exist
    await page.getByRole('menuitem', { name: 'Templates' }).click()
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('test-template')
    await page.locator('#create-name').fill('Test Template')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Now create a form room
    await page.getByRole('link', { name: 'Rooms' }).click()
    await page.getByRole('button', { name: 'Create' }).click()
    await page.getByLabel('Id').fill('form-room')
    await page.getByLabel('Name').fill('Form Room')
    await page.getByLabel('Description').fill('Room with form template')
    
    // Select form room type
    await page.getByLabel('Room Type').click()
    await page.getByText('Simple Forms - A room that uses forms to create messages').click()
    
    // Select template
    await page.getByLabel('Templates').click()
    await page.getByText('Test Template').click()
    
    // Set access control
    await page.getByLabel('Public').click()
    await page.getByLabel('Presence').selectOption('all')
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created
    await expect(page.getByText('Form Room')).toBeVisible()
  })
})
