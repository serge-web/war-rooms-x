import { test, expect, Page } from '@playwright/test'

test.describe('Admin wargame editing functionality', () => {
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
    
    // Navigate to the Wargames section
    await page.getByRole('menuitem', { name: 'Wargames' }).click()
    
    // Wait for the wargames list to load
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
  }

  test('should reset data, edit wargame title and verify changes', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
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

  test('should verify Linear turn type and its phase options', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Click on the first wargame to edit it
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    
    // Verify we're on the edit page
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Select Linear turn type
    const linearRadio = page.getByLabel('Linear')
    await linearRadio.click()
    
    // Verify that the current phase options change to n/a
    const currentPhaseSection = page.locator('fieldset#currentPhase span:has-text("Phase")')
    await expect(currentPhaseSection).toBeVisible()
    
    // Verify that only n/a option is available for Linear turn type
    const naOption = page.locator('fieldset#currentPhase input[value="n/a"]')
    await expect(naOption).toBeVisible()
    await naOption.click()
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Verify the turn type has been updated in the list
    const turnTypeCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-turnType').textContent()
    expect(turnTypeCell).toBe('Linear')
    
    // Verify the phase has been updated in the list
    const phaseCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-currentPhase').textContent()
    expect(phaseCell).toBe('n/a')
  })

  test('should verify Plan/Adjudicate turn type and its phase options', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Click on the first wargame to edit it
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    
    // Verify we're on the edit page
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Select Plan/Adjudicate turn type
    const planAdjudicateRadio = page.getByLabel('Plan/Adjudicate')
    await planAdjudicateRadio.click()
    
    // Verify that the current phase options change to Planning and Adjudication
    const currentPhaseSection = page.locator('fieldset#currentPhase')
    await expect(currentPhaseSection).toBeVisible()
    
    // Verify Planning option is available
    const planningOption = page.locator('fieldset#currentPhase input[value="Planning"]')
    await expect(planningOption).toBeVisible()
    await planningOption.click()
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Verify the turn type has been updated in the list
    const turnTypeCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-turnType').textContent()
    expect(turnTypeCell).toBe('Plan/Adjudicate')
    
    // Verify the phase has been updated in the list
    const phaseCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-currentPhase').textContent()
    expect(phaseCell).toBe('Planning')
    
    // Go back to edit and change to Adjudication phase
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Verify Adjudication option is available and select it
    const adjudicationOption = page.getByLabel('Adjudication')
    await expect(adjudicationOption).toBeVisible()
    await adjudicationOption.click()
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Verify the phase has been updated to Adjudication
    const updatedPhaseCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-currentPhase').textContent()
    expect(updatedPhaseCell).toBe('Adjudication')
  })

  test('should verify other wargame fields (interval, turn, current time)', async ({ page }) => {
    // Use the helper function to set up the admin page
    await setupAdminPage(page)
    
    // Click on the first wargame to edit it
    await page.locator('tbody tr.RaDatagrid-row:first-child .column-name').click()
    
    // Verify we're on the edit page
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible()
    
    // Update interval field - DurationInput has separate controls for number and unit
    const intervalNumberInput = page.locator('#interval-input')
    await intervalNumberInput.click()
    await intervalNumberInput.clear()
    await intervalNumberInput.fill('2')
    
    // Select 'hours' from the dropdown
    const intervalUnitSelect = page.locator('#interval-input-units')
    await intervalUnitSelect.click()
    await page.locator('text=hours').click()
    
    // Update turn field
    const turnInput = page.locator('input[name="turn"]')
    await turnInput.click()
    await turnInput.clear()
    await turnInput.fill('5')
    
    // Update current time field - first get the current date in ISO format
    const currentDate = new Date()
    const isoDate = currentDate.toISOString().split('T')[0] // Get YYYY-MM-DD part
    const timeString = '08:32' // Set a specific time
    
    // Fill the current time field
    const currentTimeInput = page.locator('input[name="currentTime"]')
    await currentTimeInput.click()
    await currentTimeInput.clear()
    await currentTimeInput.fill(`${isoDate}T${timeString}`)
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Wait for the save to complete and redirect back to the list
    await expect(page.locator('tbody tr.RaDatagrid-row')).toBeVisible()
    
    // Verify the interval has been updated in the list
    const intervalCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-interval').textContent()
    expect(intervalCell).toBe('PT2H')
    
    // Verify the turn has been updated in the list
    const turnCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-turn').textContent()
    expect(turnCell).toBe('5')
    
    // Verify the current time has been updated (partial match since formatting might differ)
    const currentTimeCell = await page.locator('tbody tr.RaDatagrid-row:first-child .column-currentTime').textContent()
    expect(currentTimeCell).toContain('8:32')
  })
})
