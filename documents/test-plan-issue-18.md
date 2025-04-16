# Behavior-Driven Test Plan for Issue #18: Add `Wargame` Resource to React-Admin Pages

This document outlines a comprehensive testing approach for the Wargame resource implementation in react-admin, covering both happy paths and error scenarios to achieve high code coverage.

## 1. Unit Tests

### 1.1 Type Definitions

```typescript
// Test that type definitions are properly exported and structured
describe('Wargame Type Definitions', () => {
  it('should export XWargame interface with correct properties', () => {
    // Verify XWargame interface has properties and state fields
    // Type checking only - no runtime test needed
  })

  it('should export RWargame interface with flattened structure', () => {
    // Verify RWargame interface has all required fields
    // Type checking only - no runtime test needed
  })
})
```

### 1.2 Mapper Functions

```typescript
describe('Wargame Mapper Functions', () => {
  // Sample test data
  const mockXWargame = {
    properties: {
      title: 'Test Wargame',
      description: 'Test Description',
      turnStyle: 'sequential',
      timeStep: '1h',
      phaseModel: ['Planning', 'Execution', 'Assessment']
    },
    state: {
      turnId: 'turn-1',
      currentTime: '2025-06-01T10:00Z',
      currentPhase: 'Planning'
    }
  }

  const mockRWargame = {
    id: 'wargame',
    title: 'Test Wargame',
    description: 'Test Description',
    turnStyle: 'sequential',
    timeStep: '1h',
    phaseModel: ['Planning', 'Execution', 'Assessment'],
    turnId: 'turn-1',
    currentTime: '2025-06-01T10:00Z',
    currentPhase: 'Planning'
  }

  it('should correctly convert XWargame to RWargame', () => {
    // GIVEN an XWargame object
    // WHEN wargameXtoR is called
    const result = wargameXtoR(mockXWargame)
    
    // THEN it should return a properly structured RWargame
    expect(result).toEqual(mockRWargame)
  })

  it('should correctly convert RWargame to XWargame', () => {
    // GIVEN an RWargame object
    // WHEN wargameRtoX is called
    const result = wargameRtoX(mockRWargame)
    
    // THEN it should return a properly structured XWargame
    expect(result.properties).toEqual(mockXWargame.properties)
    expect(result.state).toEqual(mockXWargame.state)
  })

  it('should handle empty arrays in phaseModel', () => {
    // GIVEN an XWargame with empty phaseModel
    const emptyPhaseModel = {...mockXWargame}
    emptyPhaseModel.properties.phaseModel = []
    
    // WHEN converted to RWargame
    const result = wargameXtoR(emptyPhaseModel)
    
    // THEN it should have an empty phaseModel array
    expect(result.phaseModel).toEqual([])
  })
})
```

### 1.3 Custom Data Provider

```typescript
describe('Wargame Data Provider', () => {
  // Mock client
  const mockClient = {
    getPubSubItem: jest.fn(),
    publishToPubSub: jest.fn()
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock responses
    mockClient.getPubSubItem.mockImplementation((node) => {
      if (node === 'game-properties') {
        return Promise.resolve({
          data: {
            title: 'Test Wargame',
            description: 'Test Description',
            turnStyle: 'sequential',
            timeStep: '1h',
            phaseModel: ['Planning', 'Execution', 'Assessment']
          }
        })
      } else if (node === 'game-state') {
        return Promise.resolve({
          data: {
            turnId: 'turn-1',
            currentTime: '2025-06-01T10:00Z',
            currentPhase: 'Planning'
          }
        })
      }
      return Promise.reject(new Error('Unknown node'))
    })
    
    mockClient.publishToPubSub.mockResolvedValue({ success: true })
  })

  describe('getList', () => {
    it('should fetch and combine data from game-properties and game-state nodes', async () => {
      // GIVEN a configured data provider
      const dataProvider = wargameDataProvider(mockClient)
      
      // WHEN getList is called
      const result = await dataProvider.getList()
      
      // THEN it should fetch from both PubSub nodes
      expect(mockClient.getPubSubItem).toHaveBeenCalledWith('game-properties')
      expect(mockClient.getPubSubItem).toHaveBeenCalledWith('game-state')
      
      // AND return the combined data
      expect(result.data.length).toBe(1)
      expect(result.data[0].title).toBe('Test Wargame')
      expect(result.data[0].currentPhase).toBe('Planning')
      expect(result.total).toBe(1)
    })

    it('should handle error when fetching game-properties fails', async () => {
      // GIVEN a client that fails to fetch game-properties
      mockClient.getPubSubItem.mockImplementation((node) => {
        if (node === 'game-properties') {
          return Promise.reject(new Error('Failed to fetch'))
        }
        return Promise.resolve({ data: {} })
      })
      
      // WHEN getList is called
      const dataProvider = wargameDataProvider(mockClient)
      
      // THEN it should throw an error
      await expect(dataProvider.getList()).rejects.toThrow('Failed to fetch')
    })
  })

  describe('getOne', () => {
    it('should fetch a single wargame by id', async () => {
      // GIVEN a configured data provider
      const dataProvider = wargameDataProvider(mockClient)
      
      // WHEN getOne is called with wargame id
      const result = await dataProvider.getOne({ id: 'wargame' })
      
      // THEN it should fetch from both PubSub nodes
      expect(mockClient.getPubSubItem).toHaveBeenCalledWith('game-properties')
      expect(mockClient.getPubSubItem).toHaveBeenCalledWith('game-state')
      
      // AND return the combined data
      expect(result.data.title).toBe('Test Wargame')
      expect(result.data.currentPhase).toBe('Planning')
    })
  })

  describe('update', () => {
    it('should update wargame properties and state', async () => {
      // GIVEN a configured data provider
      const dataProvider = wargameDataProvider(mockClient)
      
      // AND updated wargame data
      const updatedData = {
        id: 'wargame',
        title: 'Updated Wargame',
        description: 'Updated Description',
        turnStyle: 'simultaneous',
        timeStep: '2h',
        phaseModel: ['Planning', 'Execution'],
        turnId: 'turn-2',
        currentTime: '2025-06-01T12:00Z',
        currentPhase: 'Execution'
      }
      
      // WHEN update is called
      const result = await dataProvider.update({
        id: 'wargame',
        data: updatedData,
        previousData: {}
      })
      
      // THEN it should publish to both PubSub nodes
      expect(mockClient.publishToPubSub).toHaveBeenCalledWith(
        'game-properties',
        expect.objectContaining({
          title: 'Updated Wargame',
          description: 'Updated Description',
          turnStyle: 'simultaneous',
          timeStep: '2h',
          phaseModel: ['Planning', 'Execution']
        })
      )
      
      expect(mockClient.publishToPubSub).toHaveBeenCalledWith(
        'game-state',
        expect.objectContaining({
          turnId: 'turn-2',
          currentTime: '2025-06-01T12:00Z',
          currentPhase: 'Execution'
        })
      )
      
      // AND return the updated data
      expect(result.data).toEqual(updatedData)
    })

    it('should handle error when updating game-properties fails', async () => {
      // GIVEN a client that fails to update game-properties
      mockClient.publishToPubSub.mockImplementation((node) => {
        if (node === 'game-properties') {
          return Promise.reject(new Error('Failed to update'))
        }
        return Promise.resolve({ success: true })
      })
      
      // WHEN update is called
      const dataProvider = wargameDataProvider(mockClient)
      
      // THEN it should throw an error
      await expect(dataProvider.update({
        id: 'wargame',
        data: { title: 'Test' },
        previousData: {}
      })).rejects.toThrow('Failed to update')
    })
  })

  describe('create', () => {
    it('should create a new wargame', async () => {
      // GIVEN a configured data provider
      const dataProvider = wargameDataProvider(mockClient)
      
      // AND new wargame data
      const newData = {
        title: 'New Wargame',
        description: 'New Description',
        turnStyle: 'sequential',
        timeStep: '1h',
        phaseModel: ['Planning', 'Execution'],
        turnId: 'turn-1',
        currentTime: '2025-06-01T10:00Z',
        currentPhase: 'Planning'
      }
      
      // WHEN create is called
      const result = await dataProvider.create({
        data: newData
      })
      
      // THEN it should publish to both PubSub nodes
      expect(mockClient.publishToPubSub).toHaveBeenCalledWith(
        'game-properties',
        expect.objectContaining({
          title: 'New Wargame',
          description: 'New Description'
        })
      )
      
      expect(mockClient.publishToPubSub).toHaveBeenCalledWith(
        'game-state',
        expect.objectContaining({
          turnId: 'turn-1',
          currentPhase: 'Planning'
        })
      )
      
      // AND return the created data with id
      expect(result.data).toEqual({
        ...newData,
        id: 'wargame'
      })
    })
  })
})
```

## 2. Integration Tests

### 2.1 PubSub Integration

```typescript
describe('Wargame PubSub Integration', () => {
  // Mock XMPP client
  let mockXMPPClient
  let pubSubService

  beforeEach(() => {
    // Setup mock XMPP client with MSW
    mockXMPPClient = setupMockXMPPClient()
    pubSubService = new PubSubService(mockXMPPClient)
  })

  it('should fetch wargame data from PubSub nodes', async () => {
    // GIVEN mocked PubSub responses
    mockPubSubResponse('game-properties', {
      title: 'Test Wargame',
      description: 'Test Description',
      turnStyle: 'sequential',
      timeStep: '1h',
      phaseModel: ['Planning', 'Execution', 'Assessment']
    })
    
    mockPubSubResponse('game-state', {
      turnId: 'turn-1',
      currentTime: '2025-06-01T10:00Z',
      currentPhase: 'Planning'
    })
    
    // WHEN fetching wargame data
    const wargame = await pubSubService.getWargame()
    
    // THEN it should return combined data
    expect(wargame.properties.title).toBe('Test Wargame')
    expect(wargame.state.currentPhase).toBe('Planning')
  })

  it('should update wargame properties in PubSub', async () => {
    // GIVEN updated properties
    const updatedProperties = {
      title: 'Updated Wargame',
      description: 'Updated Description',
      turnStyle: 'simultaneous',
      timeStep: '2h',
      phaseModel: ['Planning', 'Execution']
    }
    
    // WHEN updating properties
    await pubSubService.updateWargameProperties(updatedProperties)
    
    // THEN it should publish to the game-properties node
    expect(mockXMPPClient.publish).toHaveBeenCalledWith(
      'game-properties',
      expect.objectContaining(updatedProperties)
    )
  })

  it('should handle network errors gracefully', async () => {
    // GIVEN a network error when fetching
    mockPubSubError('game-properties', 'Network error')
    
    // WHEN fetching wargame data
    // THEN it should throw an error with context
    await expect(pubSubService.getWargame()).rejects.toThrow(
      'Failed to fetch wargame data: Network error'
    )
  })
})
```

### 2.2 Data Provider with React-Admin

```typescript
describe('Wargame Data Provider with React-Admin', () => {
  // Setup mock components and providers
  let wrapper
  let dataProvider
  
  beforeEach(() => {
    // Mock the XMPP client
    const mockClient = createMockXMPPClient()
    
    // Create the data provider
    dataProvider = createDataProvider(mockClient)
    
    // Wrap with test providers
    wrapper = ({ children }) => (
      <TestContext dataProvider={dataProvider}>
        {children}
      </TestContext>
    )
  })

  it('should load wargame data in the List component', async () => {
    // GIVEN a mocked response for getList
    mockResponse(dataProvider, 'getList', {
      data: [{
        id: 'wargame',
        title: 'Test Wargame',
        description: 'Test Description',
        turnStyle: 'sequential',
        timeStep: '1h',
        phaseModel: ['Planning', 'Execution', 'Assessment'],
        turnId: 'turn-1',
        currentTime: '2025-06-01T10:00Z',
        currentPhase: 'Planning'
      }],
      total: 1
    })
    
    // WHEN rendering the WargameList component
    const { findByText } = render(<WargameList />, { wrapper })
    
    // THEN it should display the wargame data
    expect(await findByText('Test Wargame')).toBeInTheDocument()
  })

  it('should load wargame data in the Edit component', async () => {
    // GIVEN a mocked response for getOne
    mockResponse(dataProvider, 'getOne', {
      data: {
        id: 'wargame',
        title: 'Test Wargame',
        description: 'Test Description',
        turnStyle: 'sequential',
        timeStep: '1h',
        phaseModel: ['Planning', 'Execution', 'Assessment'],
        turnId: 'turn-1',
        currentTime: '2025-06-01T10:00Z',
        currentPhase: 'Planning'
      }
    })
    
    // WHEN rendering the WargameEdit component
    const { findByDisplayValue } = render(
      <WargameEdit id="wargame" />,
      { wrapper }
    )
    
    // THEN it should display the wargame data in form fields
    expect(await findByDisplayValue('Test Wargame')).toBeInTheDocument()
  })

  it('should submit updates in the Edit component', async () => {
    // GIVEN a mocked response for getOne and update
    mockResponse(dataProvider, 'getOne', {
      data: {
        id: 'wargame',
        title: 'Test Wargame',
        description: 'Test Description'
        // ... other fields
      }
    })
    
    mockResponse(dataProvider, 'update', {
      data: {
        id: 'wargame',
        title: 'Updated Wargame',
        description: 'Updated Description'
        // ... other fields
      }
    })
    
    // WHEN rendering and submitting the WargameEdit component
    const { findByLabelText, findByText } = render(
      <WargameEdit id="wargame" />,
      { wrapper }
    )
    
    // Fill in the form
    const titleInput = await findByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'Updated Wargame' } })
    
    // Submit the form
    const saveButton = await findByText('Save')
    fireEvent.click(saveButton)
    
    // THEN it should call the update method with correct data
    expect(dataProvider.update).toHaveBeenCalledWith(
      'wargames',
      expect.objectContaining({
        id: 'wargame',
        data: expect.objectContaining({
          title: 'Updated Wargame'
        })
      })
    )
  })
})
```

## 3. UI Component Tests

### 3.1 WargameList Component

```typescript
describe('WargameList Component', () => {
  it('should render the list with correct columns', () => {
    // GIVEN a test wrapper with mock data
    const wrapper = setupTestWrapper()
    
    // WHEN rendering the WargameList component
    const { getByText, getAllByRole } = render(<WargameList />, { wrapper })
    
    // THEN it should display column headers
    expect(getByText('Title')).toBeInTheDocument()
    expect(getByText('Current Phase')).toBeInTheDocument()
    expect(getByText('Current Time')).toBeInTheDocument()
    
    // AND it should have an edit button
    const buttons = getAllByRole('button')
    expect(buttons.some(button => button.textContent.includes('Edit'))).toBe(true)
  })

  it('should apply filters correctly', async () => {
    // GIVEN a test wrapper with mock data provider
    const mockDataProvider = {
      getList: jest.fn().mockResolvedValue({
        data: [],
        total: 0
      })
    }
    
    const wrapper = setupTestWrapper(mockDataProvider)
    
    // WHEN rendering the WargameList and applying a filter
    const { findByLabelText, findByText } = render(<WargameList />, { wrapper })
    
    const filterInput = await findByLabelText('Title')
    fireEvent.change(filterInput, { target: { value: 'Test' } })
    
    const filterButton = await findByText('Filter')
    fireEvent.click(filterButton)
    
    // THEN it should call getList with the filter
    expect(mockDataProvider.getList).toHaveBeenCalledWith(
      'wargames',
      expect.objectContaining({
        filter: expect.objectContaining({
          title: 'Test'
        })
      })
    )
  })
})
```

### 3.2 WargameEdit Component

```typescript
describe('WargameEdit Component', () => {
  it('should render all form fields with correct values', async () => {
    // GIVEN a test wrapper with mock data
    const wrapper = setupTestWrapper({
      record: {
        id: 'wargame',
        title: 'Test Wargame',
        description: 'Test Description',
        turnStyle: 'sequential',
        timeStep: '1h',
        phaseModel: ['Planning', 'Execution', 'Assessment'],
        turnId: 'turn-1',
        currentTime: '2025-06-01T10:00Z',
        currentPhase: 'Planning'
      }
    })
    
    // WHEN rendering the WargameEdit component
    const { findByLabelText } = render(<WargameEdit />, { wrapper })
    
    // THEN it should display all form fields with correct values
    expect(await findByLabelText('Title')).toHaveValue('Test Wargame')
    expect(await findByLabelText('Description')).toHaveValue('Test Description')
    expect(await findByLabelText('Turn Style')).toHaveValue('sequential')
    
    // Check array field rendering
    const phaseModelField = await findByLabelText('Phase Model')
    expect(phaseModelField).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    // GIVEN a test wrapper
    const wrapper = setupTestWrapper()
    
    // WHEN rendering the WargameEdit component and submitting without title
    const { findByText, findByLabelText } = render(<WargameEdit />, { wrapper })
    
    // Clear the title field
    const titleInput = await findByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: '' } })
    
    // Submit the form
    const saveButton = await findByText('Save')
    fireEvent.click(saveButton)
    
    // THEN it should display validation errors
    expect(await findByText('Title is required')).toBeInTheDocument()
  })

  it('should handle array input for phase model', async () => {
    // GIVEN a test wrapper
    const wrapper = setupTestWrapper()
    
    // WHEN rendering the WargameEdit component
    const { findByText, findByLabelText } = render(<WargameEdit />, { wrapper })
    
    // Add a new phase
    const addButton = await findByText('Add Phase')
    fireEvent.click(addButton)
    
    // Fill in the new phase
    const phaseInput = await findByLabelText('Phase 1')
    fireEvent.change(phaseInput, { target: { value: 'New Phase' } })
    
    // Submit the form
    const saveButton = await findByText('Save')
    fireEvent.click(saveButton)
    
    // THEN it should include the new phase in the submitted data
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        phaseModel: expect.arrayContaining(['New Phase'])
      })
    )
  })
})
```

### 3.3 WargameCreate Component

```typescript
describe('WargameCreate Component', () => {
  it('should render the create form with empty values', async () => {
    // GIVEN a test wrapper
    const wrapper = setupTestWrapper()
    
    // WHEN rendering the WargameCreate component
    const { findByLabelText } = render(<WargameCreate />, { wrapper })
    
    // THEN it should display empty form fields
    expect(await findByLabelText('Title')).toHaveValue('')
    expect(await findByLabelText('Description')).toHaveValue('')
  })

  it('should submit the form with default values for optional fields', async () => {
    // GIVEN a test wrapper with mock save function
    const mockSave = jest.fn().mockResolvedValue({})
    const wrapper = setupTestWrapper({ save: mockSave })
    
    // WHEN rendering the WargameCreate component and submitting with minimal data
    const { findByText, findByLabelText } = render(<WargameCreate />, { wrapper })
    
    // Fill required fields only
    const titleInput = await findByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'New Wargame' } })
    
    // Submit the form
    const saveButton = await findByText('Save')
    fireEvent.click(saveButton)
    
    // THEN it should call save with default values for optional fields
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Wargame',
        phaseModel: expect.any(Array),
        turnId: expect.any(String),
        currentPhase: expect.any(String)
      })
    )
  })
})
```

## 4. Error Handling Tests

```typescript
describe('Wargame Error Handling', () => {
  it('should display error notification when PubSub fetch fails', async () => {
    // GIVEN a data provider that fails to fetch
    const mockDataProvider = {
      getList: jest.fn().mockRejectedValue(new Error('Failed to fetch PubSub data'))
    }
    
    const wrapper = setupTestWrapper(mockDataProvider)
    
    // WHEN rendering the WargameList component
    const { findByText } = render(<WargameList />, { wrapper })
    
    // THEN it should display an error notification
    expect(await findByText('Failed to fetch PubSub data')).toBeInTheDocument()
  })

  it('should handle network errors during save operations', async () => {
    // GIVEN a data provider that fails to update
    const mockDataProvider = {
      getOne: jest.fn().mockResolvedValue({
        data: { id: 'wargame', title: 'Test Wargame' }
      }),
      update: jest.fn().mockRejectedValue(new Error('Network error during save'))
    }
    
    const wrapper = setupTestWrapper(mockDataProvider)
    
    // WHEN rendering the WargameEdit component and submitting
    const { findByText } = render(<WargameEdit id="wargame" />, { wrapper })
    
    const saveButton = await findByText('Save')
    fireEvent.click(saveButton)
    
    // THEN it should display an error notification
    expect(await findByText('Network error during save')).toBeInTheDocument()
  })

  it('should handle malformed PubSub data', async () => {
    // GIVEN a client that returns malformed data
    mockClient.getPubSubItem.mockImplementation((node) => {
      if (node === 'game-properties') {
        return Promise.resolve({
          data: null // Malformed data
        })
      }
      return Promise.resolve({ data: {} })
    })
    
    // WHEN fetching wargame data
    const dataProvider = wargameDataProvider(mockClient)
    
    // THEN it should handle the error gracefully
    await expect(dataProvider.getList()).rejects.toThrow(
      'Invalid game properties data'
    )
  })
})
```

## 5. End-to-End Tests

```typescript
describe('Wargame Resource E2E Tests', () => {
  beforeAll(async () => {
    // Setup test environment with mock XMPP server
    await setupMockXMPPServer()
  })

  beforeEach(async () => {
    // Reset the database before each test
    await page.evaluate(() => window.localStorage.clear())
  })

  it('should navigate to wargame list and display data', async () => {
    // GIVEN a logged-in admin user
    await loginAsAdmin()
    
    // WHEN navigating to the wargame list
    await page.click('a[href="/admin/wargames"]')
    
    // THEN it should display the wargame data
    await expect(page).toHaveText('Test Wargame')
    await expect(page).toHaveText('Planning')
  })

  it('should edit a wargame and save changes', async () => {
    // GIVEN a logged-in admin user
    await loginAsAdmin()
    
    // WHEN navigating to the wargame edit page
    await page.click('a[href="/admin/wargames"]')
    await page.click('button[aria-label="Edit"]')
    
    // AND updating the title
    await page.fill('input[name="title"]', 'Updated Wargame Title')
    
    // AND saving the changes
    await page.click('button[type="submit"]')
    
    // THEN it should save and redirect to the list
    await expect(page).toHaveURL('/admin/wargames')
    
    // AND display the updated data
    await expect(page).toHaveText('Updated Wargame Title')
  })

  it('should handle validation errors', async () => {
    // GIVEN a logged-in admin user
    await loginAsAdmin()
    
    // WHEN navigating to the wargame edit page
    await page.click('a[href="/admin/wargames"]')
    await page.click('button[aria-label="Edit"]')
    
    // AND clearing the required title field
    await page.fill('input[name="title"]', '')
    
    // AND attempting to save
    await page.click('button[type="submit"]')
    
    // THEN it should display validation errors
    await expect(page).toHaveText('Title is required')
    
    // AND remain on the edit page
    await expect(page).toHaveURL(/\/admin\/wargames\/\w+/)
  })
})
```

## 6. Test Coverage Goals

| Component | Coverage Target | Priority Areas |
|-----------|----------------|----------------|
| Type Definitions | 100% | Ensure all properties are correctly defined |
| Mapper Functions | 100% | Test all edge cases and data transformations |
| Data Provider | 90% | Focus on error handling and edge cases |
| PubSub Integration | 85% | Test network errors and data validation |
| UI Components | 85% | Test form validation and user interactions |
| End-to-End | 80% | Cover critical user flows |

## 7. Test Implementation Sequence

1. Start with unit tests for type definitions and mapper functions
2. Implement tests for the custom data provider
3. Add integration tests for PubSub service
4. Create UI component tests
5. Implement error handling tests
6. Finish with end-to-end tests

This test plan ensures comprehensive coverage of the Wargame resource implementation, focusing on both functionality and error handling to achieve high code quality and reliability.
