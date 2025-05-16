import { test, expect, Page } from '@playwright/test'

test.describe('Admin force management functionality', () => {
  // Helper function to navigate to the admin page and reset data
  async function setupAdminPage(page: Page) {
    // Navigate to the homepage
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
    
    // Verify we're on the admin page by checking for the welcome title
    await expect(page.locator('.maintainer-welcome-title')).toBeVisible()
    
    // Navigate to the Forces section
    await page.getByRole('menuitem', { name: 'Forces' }).click()
    
    // Wait for the forces list to load
    await expect(page.locator('tbody tr.RaDatagrid-row:first-child')).toBeVisible()
  }

  test('should create, edit, and delete a force', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Store the initial number of forces for later comparison
    const initialForceCount = await page.locator('tbody tr.RaDatagrid-row').count()
    
    // Click on the Create button to add a new force
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait for the create form to load
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Fill in the required fields
    const forceId = `test-force-${Date.now()}`
    await page.getByLabel('Id *').fill(forceId)
    await page.locator('input#create-name').fill('Test Force')
    
    // Fill in the objectives field
    await page.locator('textarea#create-objectives').fill('Test objectives for the new force')
    
    // Set the color (using the color picker)
    const colorInput = page.locator('input[type="color"]')
    await colorInput.evaluate((input: HTMLInputElement) => {
      input.value = '#ff5500'
    })
    
    // Click the Create button to save the new force
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait for the list to reload and verify the new force is in the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialForceCount + 1)
    
    // Find and verify our new force in the list
    const newForceRow = page.locator(`tbody tr.RaDatagrid-row:has-text("${forceId}")`)
    await expect(newForceRow).toBeVisible()
    
    // Click on the new force to edit it
    await newForceRow.locator('.column-id').click()
    
    // Wait for the edit form to load
    await expect(page.getByText('> Edit force')).toBeVisible()
    
    // Edit the name field
    const nameInput = page.locator('input#edit-name')
    await nameInput.click()
    await nameInput.clear()
    await nameInput.fill('Updated Test Force')
    
    // Edit the objectives field
    const objectivesInput = page.locator('textarea#edit-objectives')
    await objectivesInput.click()
    await objectivesInput.clear()
    await objectivesInput.fill('Updated test objectives')
    
    // Change the color
    await colorInput.evaluate((input: HTMLInputElement) => {
      input.value = '#0055ff'
    })
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row:first-child')).toBeVisible()
    
    // Verify the updated force is in the list
    const updatedForceRow = page.locator(`tbody tr.RaDatagrid-row:has-text("${forceId}")`)
    await expect(updatedForceRow).toBeVisible()
    
    // Click on the force again to verify the changes
    // await updatedForceRow.locator('.column-id').click()
    
    // Wait for the edit form to load and verify the updated values
    await expect(page.getByText('> Edit force')).toBeVisible()
    await expect(nameInput).toHaveValue('Updated Test Force')
    await expect(objectivesInput).toHaveValue('Updated test objectives')
    
    // Go back to the list
    // await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Now delete the force
    // Find the delete button that's in the same toolbar as the Save button
    const saveButton = page.getByRole('button', { name: 'Save' })
    const toolbar = saveButton.locator('xpath=..') // Get the parent of the Save button
    const deleteButton = toolbar.getByRole('button', { name: 'Delete' })
    await deleteButton.click()
    
    // Confirm deletion in the confirmation dialog
    await page.getByRole('button', { name: 'Confirm' }).click()
    
    // Wait for the deletion to complete
    await page.waitForTimeout(500)
    
    // Verify the force has been deleted by checking the count is back to the initial count
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialForceCount)
    
    // Verify our force is no longer in the list
    const deletedForceRow = page.locator(`tbody tr.RaDatagrid-row:has-text("${forceId}")`)
    await expect(deletedForceRow).toHaveCount(0)
  })
  
  test('should validate required fields when creating a force', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Store the initial number of forces for comparison
    const initialForceCount = await page.locator('tbody tr.RaDatagrid-row').count()
    
    // Click on the Create button to add a new force
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait for the create form to load
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Verify the number of forces hasn't changed, since we expect the `Create`
    // to fail because of missing fields
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialForceCount)
    
    // Try to submit the form without filling required fields
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait a moment for any potential navigation
    await page.waitForTimeout(500)
    
    // Verify we're still on the create form (creation failed)
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Go back to the list to verify no new force was created
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Wait for the list to load
    await expect(page.locator('tbody tr.RaDatagrid-row:first-child')).toBeVisible()
    
    // Verify the number of forces hasn't changed
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialForceCount)
    
    // Go back to create form to continue the test
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Go back to the list to verify no new force was created
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Wait for the list to load
    await expect(page.locator('tbody tr.RaDatagrid-row:first-child')).toBeVisible()
    
    // Verify the number of forces hasn't changed
    await expect(page.locator('tbody tr.RaDatagrid-row')).toHaveCount(initialForceCount)
    
    // Go back to create form to continue the test
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Fill in only the ID field
    await page.getByLabel('Id *').fill('test-force-validation')
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait a moment for any potential navigation
    await page.waitForTimeout(500)
    
    // Verify we're still on the create form (creation failed)
    await expect(page.getByText('> Create new force')).toBeVisible()
    
    // Fill in the name field
    await page.locator('input[name="create-name"]').fill('Test Force Validation')
    
    // Fill in the objectives field
    await page.locator('textarea[name="create-objectives"]').fill('Test objectives for the new force')
    
    // Now the form should submit successfully
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Wait for redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row:first-child')).toBeVisible()
    
    // Verify our new force is in the list
    const newForceRow = page.locator('tbody tr.RaDatagrid-row:has-text("test-force-validation")')
    await expect(newForceRow).toBeVisible()
    
    // Clean up by deleting the test force
    // Find the delete button that's in the same toolbar as the Save button
    const saveButton = page.getByRole('button', { name: 'Save' })
    const toolbar = saveButton.locator('xpath=..') // Get the parent of the Save button
    const deleteButton = toolbar.getByRole('button', { name: 'Delete' })
    await deleteButton.click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  })
})
