import { test, expect } from '@playwright/test'

test.describe('Admin Rooms Management', () => {
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

  test('should create, edit, and delete a chat room', async ({ page }) => {
    // Navigate to Rooms
    await page.getByRole('menuitem', { name: 'Rooms' }).click()
    
    // Store initial count of rooms
    const initialRoomCount = await page.locator('tbody tr.RaDatagrid-row').count()
    
    // Create a new chat room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('test-room')
    await page.locator('#create-name').fill('Test Room')
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
    await page.getByRole('row', { name: 'Test Room' }).click()
    await page.locator('#edit-name').fill('Updated Test Room')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify room was updated
    await expect(page.getByText('Updated Test Room')).toBeVisible()
    
    // Delete the room
    const roomRow = page.getByRole('row', { name: 'Updated Test Room' })
    await roomRow.locator('input[type="checkbox"]').click()
    await page.getByRole('button', { name: 'Delete' }).first().click()
    
    // Verify room was deleted
    await expect(page.getByText('Updated Test Room')).not.toBeVisible()
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialRoomCount)
  })

  test('should create a form room with templates', async ({ page }) => {
    // Navigate to Templates
    await page.getByRole('menuitem', { name: 'Templates' }).click()
    
    // Create a test template
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('test-template')
    await page.locator('#create-name').fill('Test Template')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Navigate to Rooms
    await page.getByRole('menuitem', { name: 'Rooms' }).click()
    
    // Create a new form room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill('form-room')
    await page.locator('#create-name').fill('Form Room')
    await page.locator('#create-description').fill('Room with form template')
    
    // Select form room type
    await page.getByRole('combobox', { name: 'Room Type' }).click()
    await page.getByText('Simple Forms - A room that uses forms to create messages').click()
    
    // Select template
    await page.getByLabel('Templates').click()
    await page.getByText('Test Template').click()
    
    // Set access control
    await page.getByRole('button', { name: 'Public' }).click()
    await page.getByRole('combobox', { name: 'Presence' }).click()
    await page.getByRole('option', { name: 'All' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created
    await expect(page.getByText('Form Room')).toBeVisible()
  })

  test('should validate required fields when creating a room', async ({ page }) => {
    // Navigate to Rooms
    await page.getByRole('menuitem', { name: 'Rooms' }).click()
    
    // Store initial count of rooms
    const initialRoomCount = await page.locator('tbody tr.RaDatagrid-row').count()
    
    // Click Create button
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify error messages
    await expect(page.getByText('Required')).toHaveCount(2) // ID and Name are required
    
    // Fill only ID
    await page.locator('#create-id').fill('test-room-2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Fill only name
    await page.locator('#create-id').clear()
    await page.locator('#create-name').fill('Test Room 2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Fill both required fields
    await page.locator('#create-id').fill('test-room-2')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Room type is also required, so we should still see an error
    await expect(page.getByText('Required')).toBeVisible()
    
    // Select room type
    await page.locator('#edit-room-type').click()
    await page.getByRole('option', { name: 'Chat Room - A standard chat room' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created
    await expect(page.getByText('Test Room 2')).toBeVisible()
    
    // Verify the count increased by 1
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialRoomCount + 1)
  })
})
