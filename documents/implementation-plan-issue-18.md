# Implementation Plan for Issue #18: Add `Wargame` resource to react-admin pages

## Understanding the Issue

The issue requires adding a Wargame resource to the react-admin pages. The wargame metadata needs to be stored in PubSub documents rather than OpenFire objects, requiring a custom data provider implementation.

## Implementation Plan

### 1. Create Wargame Types

First, we need to define the types for the Wargame resource:

1. Create `XWargame` and `RWargame` interfaces in `src/components/AdminView/raTypes-d.ts`:
   - `XWargame`: The composite structure combining game-properties and game-state
   - `RWargame`: A flatter representation for react-admin

### 2. Implement Wargame Mapper

2. Add a mapper for the Wargame resource in `src/components/AdminView/raHelpers.ts`:
   - Create `wargameXtoR` and `wargameRtoX` functions
   - Add a `WargameMapper` with a custom `dataProvider` property
   - Add the mapper to the `mappers` array

### 3. Extend Data Provider

3. Modify the data provider in `src/components/AdminView/dataProvider.ts`:
   - Add logic to check for the `dataProvider` property on mappers
   - Implement custom methods for the Wargame resource that interact with PubSub

### 4. Create Wargame PubSub Service

4. Create a service to interact with PubSub for Wargame data:
   - Implement methods to read/write game-properties and game-state
   - Create functions to convert between the composite and flat representations

### 5. Create Wargame Resource Components

5. Create a new file `src/components/AdminView/Resources/wargame.tsx`:
   - Implement List, Edit, and Create components for the Wargame resource
   - Design appropriate form fields for wargame metadata

### 6. Add Resource to Admin View

6. Update `src/components/AdminView/index.tsx` to include the new Wargame resource.

## Detailed Tasks

1. **Define Types**:
   - Create `XWargame` interface with properties for both game-properties and game-state
   - Create `RWargame` interface with flattened properties for react-admin

2. **Create Mapper Functions**:
   - Implement `wargameXtoR` to convert from composite to flat format
   - Implement `wargameRtoX` to convert from flat to composite format
   - Create custom data provider methods for Wargame CRUD operations

3. **PubSub Integration**:
   - Implement functions to read/write to game-properties and game-state PubSub nodes
   - Handle synchronization between the two data structures

4. **UI Components**:
   - Create form fields for wargame properties (title, description, turn style, etc.)
   - Implement validation for the form fields
   - Create appropriate list view with filters and sorting

5. **Testing**:
   - Create unit tests for the mapper functions
   - Test the PubSub integration
   - Verify the UI components work correctly

## Implementation Sequence

1. Start with type definitions
2. Implement the mapper functions
3. Create the PubSub service
4. Extend the data provider
5. Build the UI components
6. Add the resource to the admin view
7. Test the implementation

## Code Snippets

### Type Definitions

```typescript
// Add to raTypes-d.ts

/**
 * Wargame properties from PubSub
 */
export interface XWargameProperties extends XRecord {
  title: string
  description: string
  turnStyle: string
  timeStep: string
  phaseModel: string[]
}

/**
 * Wargame state from PubSub
 */
export interface XWargameState extends XRecord {
  turnId: string
  currentTime: string
  currentPhase: string
}

/**
 * Combined Wargame representation from PubSub
 */
export interface XWargame extends XRecord {
  properties: XWargameProperties
  state: XWargameState
}

/**
 * Flattened Wargame representation for react-admin
 */
export interface RWargame extends RaRecord {
  id: string
  title: string
  description: string
  turnStyle: string
  timeStep: string
  phaseModel: string[]
  turnId: string
  currentTime: string
  currentPhase: string
}
```

### Mapper Implementation

```typescript
// Add to raHelpers.ts

const wargameXtoR = (result: XWargame): RWargame => {
  return {
    id: 'wargame', // Single wargame instance
    title: result.properties.title,
    description: result.properties.description,
    turnStyle: result.properties.turnStyle,
    timeStep: result.properties.timeStep,
    phaseModel: result.properties.phaseModel,
    turnId: result.state.turnId,
    currentTime: result.state.currentTime,
    currentPhase: result.state.currentPhase
  }
}

const wargameRtoX = (result: RWargame): XWargame => {
  return {
    properties: {
      title: result.title,
      description: result.description,
      turnStyle: result.turnStyle,
      timeStep: result.timeStep,
      phaseModel: result.phaseModel
    },
    state: {
      turnId: result.turnId,
      currentTime: result.currentTime,
      currentPhase: result.currentPhase
    }
  }
}

// Custom data provider for Wargame
const wargameDataProvider = (client: XMPPRestService) => ({
  getList: async (): Promise<GetListResult> => {
    // Fetch from PubSub
    const propertiesNode = await client.getPubSubItem('game-properties')
    const stateNode = await client.getPubSubItem('game-state')
    
    const xWargame = {
      properties: propertiesNode.data,
      state: stateNode.data
    }
    
    const rWargame = wargameXtoR(xWargame)
    
    return { 
      data: [rWargame], 
      total: 1 
    }
  },
  
  getOne: async (params: GetOneParams): Promise<GetOneResult> => {
    // Fetch from PubSub
    const propertiesNode = await client.getPubSubItem('game-properties')
    const stateNode = await client.getPubSubItem('game-state')
    
    const xWargame = {
      properties: propertiesNode.data,
      state: stateNode.data
    }
    
    const rWargame = wargameXtoR(xWargame)
    
    return { data: rWargame }
  },
  
  update: async (params: UpdateParams): Promise<{ data: RWargame }> => {
    const xWargame = wargameRtoX(params.data as RWargame)
    
    // Update PubSub nodes
    await client.updatePubSubItem('game-properties', xWargame.properties)
    await client.updatePubSubItem('game-state', xWargame.state)
    
    return { data: params.data as RWargame }
  },
  
  create: async (params: CreateParams): Promise<{ data: RWargame }> => {
    const xWargame = wargameRtoX(params.data as RWargame)
    
    // Create PubSub nodes
    await client.createPubSubItem('game-properties', xWargame.properties)
    await client.createPubSubItem('game-state', xWargame.state)
    
    return { data: params.data as RWargame }
  }
})

const WargameMapper: ResourceHandler<XWargame, RWargame> = {
  resource: 'wargame',
  toRRecord: wargameXtoR,
  toXRecord: wargameRtoX,
  dataProvider: wargameDataProvider
}

// Add to mappers array
export const mappers: AnyResourceHandler[] = [
  GroupMapper,
  RoomMapper,
  UserMapper,
  WargameMapper
]
```

### Data Provider Extension

```typescript
// Modify dataProvider.ts to check for custom dataProvider

export default (client: XMPPRestService): DataProvider => ({
  // get a list of records based on sort, filter, and pagination
  getList: async (resource: string, params: GetListParams & QueryFunctionContext): Promise<GetListResult> => {
    const mapper = mappers.find(m => m.resource === resource)
    if (!mapper) {
      return { data: [], total: 0 }
    }
    
    // Check if mapper has a custom dataProvider
    if (mapper.dataProvider) {
      return await mapper.dataProvider(client).getList(params)
    }
    
    // Existing implementation...
  },
  
  // Similar modifications for other methods...
})
```

### React-Admin Resource

```typescript
// Create wargame.tsx in Resources folder

import React from 'react'
import { 
  List, 
  Datagrid, 
  TextField, 
  Edit, 
  SimpleForm, 
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  Create
} from 'react-admin'

export const ListWargame = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="turnId" />
      <TextField source="currentPhase" />
    </Datagrid>
  </List>
)

export const EditWargame = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <TextInput source="turnStyle" />
      <TextInput source="timeStep" />
      <ArrayInput source="phaseModel">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="turnId" />
      <TextInput source="currentTime" />
      <TextInput source="currentPhase" />
    </SimpleForm>
  </Edit>
)

export const CreateWargame = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <TextInput source="turnStyle" />
      <TextInput source="timeStep" />
      <ArrayInput source="phaseModel">
        <SimpleFormIterator>
          <TextInput />
        </SimpleFormIterator>
      </ArrayInput>
      <TextInput source="turnId" />
      <TextInput source="currentTime" />
      <TextInput source="currentPhase" />
    </SimpleForm>
  </Create>
)
```

### Update Admin View

```typescript
// Update index.tsx

import React from 'react'
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { ListGroup } from './Resources/groups'
import { ListUser } from './Resources/users'
import { ListRoom } from './Resources/rooms'
import { ListWargame, EditWargame, CreateWargame } from './Resources/wargame'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  if (!restClient) return null
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="wargame" list={ListWargame} edit={EditWargame} create={CreateWargame} />
    <Resource name="groups" list={ListGroup} />
    <Resource name="users" list={ListUser} />
    <Resource name="chatrooms" list={ListRoom} />
  </Admin>
  )
}
```
