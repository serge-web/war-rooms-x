import { test, expect, Page } from '@playwright/test'

test.describe('Admin template editor functionality', () => {
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
    
    // Navigate to the Templates section
    await page.getByRole('menuitem', { name: 'Templates' }).click()
    
    // Wait for the templates list to load (first row)
    await expect(page.locator('tbody tr.RaDatagrid-row').first()).toBeVisible()
  }

  test('should edit Situation Report template using visual builder', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Find the Situation Report template row
    const situationReportRow = page.locator('tbody tr.RaDatagrid-row').filter({ 
      hasText: 'Situation Report' 
    })
    await expect(situationReportRow).toBeVisible()
    
    // Click the Edit button in the row
    await situationReportRow.locator('a').click()
    
    // Verify we're on the edit page
    await expect(page.locator('h6').filter({ hasText: 'Edit Template' })).toBeVisible()
    
    // Verify the visual builder tab is active by default
    await expect(page.locator('.ant-tabs-tab-active').filter({ hasText: 'Visual Builder' })).toBeVisible()
    
    // Find the Report Title field in the form builder
    const reportTitleField = page.locator('.form-builder').getByText('Report Title')
    await expect(reportTitleField).toBeVisible()
    
    // Click on the Report Title field to edit it
    await reportTitleField.click()
    
    // Find and edit the description field
    const descriptionField = page.locator('.form-builder input[placeholder="Description"]').nth(1)
    await expect(descriptionField).toBeVisible()
    
    // Clear the current description and enter a new one
    await descriptionField.clear()
    await descriptionField.fill('Updated report title description for E2E test')
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify we're back on the templates list
    await expect(page.locator('h6').filter({ hasText: 'Templates - Create new template' })).toBeVisible()
  })

  test('should edit Situation Report template using manual JSON editor', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Find the Situation Report template row
    const situationReportRow = page.locator('tbody tr.RaDatagrid-row').filter({ 
      hasText: 'Situation Report' 
    })
    await expect(situationReportRow).toBeVisible()
    
    // Click the Edit button in the row
    await situationReportRow.locator('a').click()
    
    // Verify we're on the edit page
    await expect(page.locator('h6').filter({ hasText: 'Edit Template' })).toBeVisible()
    
    // Switch to the Manual JSON tab
    await page.getByRole('tab', { name: 'Manual JSON' }).click()
    
    // Verify the Manual JSON tab is active
    await expect(page.locator('.ant-tabs-tab-active').filter({ hasText: 'Manual JSON' })).toBeVisible()
    
    // Get the current schema JSON
    const schemaTextarea = page.locator('textarea').first()
    await expect(schemaTextarea).toBeVisible()
    const originalSchema = await schemaTextarea.inputValue()
    
    // Parse the schema to modify it
    const schema = JSON.parse(originalSchema)
    
    // Find the Report Title field and update its description
    for (const key in schema.properties) {
      if (schema.properties[key].title === 'Report Title') {
        schema.properties[key].description = 'Manually updated report title description via JSON editor'
        break
      }
    }
    
    // Update the schema in the textarea
    await schemaTextarea.clear()
    await schemaTextarea.fill(JSON.stringify(schema, null, 2))
    
    // Apply the changes
    await page.getByRole('button', { name: 'Apply Changes' }).first().click()
    
    // Save the template
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify we're back on the templates list
    await expect(page.locator('h6').filter({ hasText: 'Templates - Create new template' })).toBeVisible()
  })

  test('should verify changes persist between visual builder and manual JSON tabs', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Find the Situation Report template row
    const situationReportRow = page.locator('tbody tr.RaDatagrid-row').filter({ 
      hasText: 'Situation Report' 
    })
    await expect(situationReportRow).toBeVisible()
    
    // Click the Edit button in the row
    await situationReportRow.locator('a').click()
    
    // Verify we're on the edit page
    await expect(page.locator('h6').filter({ hasText: 'Edit Template' })).toBeVisible()
    
    // Start with the visual builder tab (default)
    await expect(page.locator('.ant-tabs-tab-active').filter({ hasText: 'Visual Builder' })).toBeVisible()
    
    // Find the Report Title field in the form builder
    const reportTitleField = page.locator('.form-builder').getByText('Report Title')
    await expect(reportTitleField).toBeVisible()
    
    // Click on the Report Title field to edit it
    await reportTitleField.click()
    
    // Find and edit the description field
    const descriptionField = page.locator('.form-builder input[placeholder="Description"]').nth(1)
    await expect(descriptionField).toBeVisible()
    
    // Clear the current description and enter a new one
    await descriptionField.clear()
    await descriptionField.fill('Cross-tab persistence test description')
    
    // Switch to the Manual JSON tab
    await page.getByRole('tab', { name: 'Manual JSON' }).click()
    
    // Verify the Manual JSON tab is active
    await expect(page.locator('.ant-tabs-tab-active').filter({ hasText: 'Manual JSON' })).toBeVisible()
    
    // Get the current schema JSON
    const schemaTextarea = page.locator('textarea').first()
    await expect(schemaTextarea).toBeVisible()
    const schemaText = await schemaTextarea.inputValue()
    
    // Parse the schema to verify the changes
    const schema = JSON.parse(schemaText)
    
    // Find the Report Title field and verify its description was updated
    let descriptionFound = false
    for (const key in schema.properties) {
      if (schema.properties[key].title === 'Report Title') {
        expect(schema.properties[key].description).toBe('Cross-tab persistence test description')
        descriptionFound = true
        break
      }
    }
    
    // Verify we found and checked the description
    expect(descriptionFound).toBe(true)
    
    // Make a change in the manual editor
    for (const key in schema.properties) {
      if (schema.properties[key].title === 'Report Title') {
        schema.properties[key].description = 'Updated from manual editor'
        break
      }
    }
    
    // Update the schema in the textarea
    await schemaTextarea.clear()
    await schemaTextarea.fill(JSON.stringify(schema, null, 2))
    
    // Apply the changes
    await page.getByRole('button', { name: 'Apply Changes' }).first().click()
    
    // Switch back to the visual builder tab
    await page.getByRole('tab', { name: 'Visual Builder' }).click()
    
    // Verify the visual builder tab is active
    await expect(page.locator('.ant-tabs-tab-active').filter({ hasText: 'Visual Builder' })).toBeVisible()
    
    // Find the Report Title field again and click on it
    await reportTitleField.click()
    
    // Verify the description field has been updated
    await expect(descriptionField).toHaveValue('Updated from manual editor')
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify we're back on the templates list
    await expect(page.locator('h6').filter({ hasText: 'Templates - Create new template' })).toBeVisible()
  })
})
