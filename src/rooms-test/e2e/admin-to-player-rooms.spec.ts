import { test, expect, Page } from '@playwright/test'

/**
 * E2E test to verify that changes made in the admin interface are reflected in the player view
 * This test creates different room types in the admin interface and verifies they appear in the player view
 */
test.describe('Admin changes reflected in player view', () => {
  // Helper function to set up and reset the test environment
  async function setupTestEnvironment(page: Page) {
    // Navigate to the homepage
    await page.goto('/')
    
    // Verify the page has loaded by checking for the login card
    await expect(page.locator('.login-card')).toBeVisible()

    // Reset the data store first
    await expect(page.locator('.reset-data-button')).toBeVisible()
    await page.locator('.reset-data-button').click()
    
    // Wait a moment for the reset to complete
    await page.waitForTimeout(100)
    
    // If the modal is visible, close it, but don't fail if it's not
    try {
      const okButton = page.getByRole('button', { name: 'OK' })
      if (await okButton.isVisible())
        await okButton.click()
    } catch {
      // Modal might not be visible, continue with the test
      console.log('Modal not visible or already closed')
    }
  }

  // Helper function to log in as admin
  async function loginAsAdmin(page: Page) {
    // Log in with mock REST admin
    await expect(page.locator('.mock-rest-button')).toBeVisible()
    await page.locator('.mock-rest-button').click()
    
    // Verify we're on the admin page by checking for the welcome title
    await expect(page.locator('.maintainer-welcome-title')).toBeVisible()
  }

  // Helper function to log in as blue-co player
  async function loginAsBluePlayer(page: Page) {
    // Log in with mock player (blue force) using development quick-links
    const mockPlayerButtons = page.locator('.login-mock-blue-co')
    await expect(mockPlayerButtons).toBeVisible()
    await mockPlayerButtons.click()
    
    // Wait for the player view to load
    await expect(page.locator('.rooms-list-container')).toBeVisible()
  }
  
  // Helper function to log in as red-co player
  async function loginAsRedPlayer(page: Page) {
    // Log in with mock player (red force) using development quick-links
    const mockPlayerButtons = page.locator('.login-mock-red-co')
    await expect(mockPlayerButtons).toBeVisible()
    await mockPlayerButtons.click()
    
    // Wait for the player view to load
    await expect(page.locator('.rooms-list-container')).toBeVisible()
  }

  // Helper function to verify a room exists in the admin interface, handling pagination
  async function verifyRoomExists(page: Page, roomName: string) {
    // Navigate to the rooms list using direct URL navigation to avoid click interception issues
    await page.goto('/#/chatrooms')
    
    // Wait for the rooms list to be visible
    await page.waitForSelector('tbody tr.RaDatagrid-row', { timeout: 5000 })
    
    // Try to find the room on the first page
    const roomOnFirstPage = await page.getByText(roomName).isVisible().catch(() => false)
    
    // If not found on first page, check the second page
    if (!roomOnFirstPage) {
      // Navigate to the second page
      const nextPageButton = page.getByRole('button', { name: 'Go to next page' })
      if (await nextPageButton.isVisible()) {
        await nextPageButton.click()
        // Wait for the page to load
        await page.waitForTimeout(500)
      }
    }
    
    // Now verify the room is visible
    await expect(page.getByText(roomName)).toBeVisible()
  }

  // Helper function to create a chat room in the admin interface
  async function createChatRoom(page: Page, roomId: string, roomName: string) {
    // Navigate to Rooms using direct URL navigation to avoid click interception issues
    await page.goto('/#/chatrooms')
    
    // Create a new chat room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill(roomId)
    await page.locator('#create-name').fill(roomName)
    await page.locator('#create-description').fill(`Test chat room created at ${new Date().toISOString()}`)
    
    // Select room type
    await page.locator('#edit-room-type').click()
    await page.getByRole('option', { name: 'Chat Room - A standard chat room' }).click()
    
    // Add blue-co as a member
    await page.getByLabel('Members').click()
    await page.getByRole('option', { name: 'Blue CO' }).click()
    
    // Set access control to public and visible to all
    await page.getByRole('button', { name: 'Public' }).click()
    await page.getByRole('combobox', { name: 'Presence' }).click()
    await page.getByRole('option', { name: 'All' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created (with pagination handling)
    await verifyRoomExists(page, roomName)
  }

  // Helper function to create a form room in the admin interface
  async function createFormRoom(page: Page, roomId: string, roomName: string) {
    // First, make sure we have a template to use
    // Navigate to Templates directly via URL to avoid click interception issues
    await page.goto('/#/templates')
    await page.waitForSelector('tbody tr.RaDatagrid-row', { timeout: 5000 })
    
    // Check if the Situation Report template exists
    const situationReportExists = await page.locator('tbody tr.RaDatagrid-row').filter({ 
      hasText: 'Situation Report' 
    }).count() > 0
    
    if (!situationReportExists) {
      // Create a simple template if it doesn't exist
      await page.getByRole('button', { name: 'Create' }).click()
      await page.locator('#create-id').fill('situation-report')
      await page.locator('#create-name').fill('Situation Report')
      await page.getByRole('button', { name: 'Save' }).click()
      
      // Verify template was created
      await expect(page.getByText('Situation Report')).toBeVisible()
    }
    
    // Navigate to Rooms using direct URL navigation to avoid click interception issues
    await page.goto('/#/chatrooms')
    
    // Create a new form room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill(roomId)
    await page.locator('#create-name').fill(roomName)
    await page.locator('#create-description').fill(`Test form room created at ${new Date().toISOString()}`)
    
    // Select form room type
    await page.getByRole('combobox', { name: 'Room Type' }).click()
    await page.getByText('Simple Forms - A room that uses forms to create messages').click()
    
    // Select template
    await page.getByLabel('Templates').click()
    // Use getByRole with option to be more specific
    await page.getByRole('option', { name: 'Situation Report' }).click()
    
    // Add blue-co as a member
    await page.getByLabel('Members').click()
    await page.getByRole('option', { name: 'Blue CO' }).click()
    
    // Set access control to public and visible to all
    await page.getByRole('button', { name: 'Public' }).click()
    await page.getByRole('combobox', { name: 'Presence' }).click()
    await page.getByRole('option', { name: 'All' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created (with pagination handling)
    await verifyRoomExists(page, roomName)
  }

  // Helper function to create a map room in the admin interface
  async function createMapRoom(page: Page, roomId: string, roomName: string) {
    // Navigate to Rooms using direct URL navigation to avoid click interception issues
    await page.goto('/#/chatrooms')
    
    // Create a new map room
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('#create-id').fill(roomId)
    await page.locator('#create-name').fill(roomName)
    
    // Create a description with map room specifics
    // Use a more controlled map configuration to prevent CSS leakage
    const mapRoomDetails = {
      specifics: {
        roomType: 'map',
        mapUrl: 'https://example.com/map.png',
        cssOverride: '.leaflet-container { display: none; }'
      }
    }
    await page.locator('#create-description').fill(JSON.stringify(mapRoomDetails))
    
    // Select room type
    await page.locator('#edit-room-type').click()
    await page.getByRole('option', { name: 'Chat Room - A standard chat room' }).click()
    
    // Add blue-co as a member
    await page.getByLabel('Members').click()
    await page.getByRole('option', { name: 'Blue CO' }).click()
    
    // Set access control to public and visible to all
    await page.getByRole('button', { name: 'Public' }).click()
    await page.getByRole('combobox', { name: 'Presence' }).click()
    await page.getByRole('option', { name: 'All' }).click()
    
    // Save the room
    await page.getByRole('button', { name: 'Create' }).click()
    
    // Verify room was created (with pagination handling)
    await verifyRoomExists(page, roomName)
  }

  test('should create rooms in admin view and verify access control works correctly', async ({ page }) => {
    // Set up the test environment
    await setupTestEnvironment(page)
    
    // Log in as admin
    await loginAsAdmin(page)
    
    // Generate unique IDs for the test rooms
    const timestamp = `${Date.now()}`.slice(-5)
    const chatRoomId = `chat-${timestamp}`
    const chatRoomName = `Chat ${timestamp}`
    const formRoomId = `form-${timestamp}`
    const formRoomName = `Form ${timestamp}`
    const mapRoomId = `map-${timestamp}`
    const mapRoomName = `Map ${timestamp}`
    
    // Create different types of rooms with blue-co as a member
    await createChatRoom(page, chatRoomId, chatRoomName)
    await createFormRoom(page, formRoomId, formRoomName)
    await createMapRoom(page, mapRoomId, mapRoomName)
    
    // Log out from admin
    await page.goto('/')
    
    // Log in as blue-co player
    await loginAsBluePlayer(page)
    
    // Wait for the rooms to load in the player view
    await page.waitForTimeout(1000)
    
    // Verify all created rooms are visible to blue-co in the player view
    // We look for the room names in the FlexLayout tabs - checking only the first instance of each
    await expect(page.locator('.flexlayout__tab_button_content').filter({ hasText: chatRoomName }).first()).toBeVisible()
    await expect(page.locator('.flexlayout__tab_button_content').filter({ hasText: formRoomName }).first()).toBeVisible()
    await expect(page.locator('.flexlayout__tab_button_content').filter({ hasText: mapRoomName }).first()).toBeVisible()
    
    // Click on each room tab to verify the content loads correctly
    // Chat room
    await page.locator('.flexlayout__tab_button_content').filter({ hasText: chatRoomName }).first().click()
    await expect(page.locator('.room-content').first()).toBeVisible()
    
    // Form room
    await page.locator('.flexlayout__tab_button_content').filter({ hasText: formRoomName }).first().click()
    await expect(page.locator('.simple-form-content').first()).toBeVisible()
    
    // Map room
    await page.locator('.flexlayout__tab_button_content').filter({ hasText: mapRoomName }).first().click()
    await expect(page.locator('.map-content')).toBeVisible()
    
    // Log out from blue-co player
    await page.goto('/')
    
    // Log in as red-co player
    await loginAsRedPlayer(page)
    
    // Wait for the rooms to load in the player view
    await page.waitForTimeout(1000)
    
    // Verify the rooms are NOT visible to red-co player
    // We check that the room names are not present in the FlexLayout tabs
    const chatRoomVisible = await page.locator('.flexlayout__tab_button_content').filter({ hasText: chatRoomName }).count() > 0
    const formRoomVisible = await page.locator('.flexlayout__tab_button_content').filter({ hasText: formRoomName }).count() > 0
    const mapRoomVisible = await page.locator('.flexlayout__tab_button_content').filter({ hasText: mapRoomName }).count() > 0
    
    // Assert that none of the rooms are visible to red-co
    expect(chatRoomVisible).toBe(false)
    expect(formRoomVisible).toBe(false)
    expect(mapRoomVisible).toBe(false)
  })
})