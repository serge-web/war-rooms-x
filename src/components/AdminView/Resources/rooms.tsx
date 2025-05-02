import { AutocompleteArrayInput, BooleanField, BooleanInput, Create, Datagrid, Edit, List, ReferenceArrayInput, SaveButton, SelectInput, SimpleForm, TextInput, Toolbar, useGetList, useRecordContext } from 'react-admin'
import { RRoom, RUser } from '../raTypes-d'
import { Box } from '@mui/material'
import { useState } from 'react'
import { ChatRoomConfig, FormRoomConfig, RoomDetails } from '../../../types/rooms-d'
import { roomTypeFactory } from '../../../services/roomTypes'
import { RoomTypeStrategy } from '../../../services/roomTypes/RoomTypeStrategy'

interface BoldNameFieldProps {
  source: string
  selectedId: string | null
}

const BoldNameField = ({ source, selectedId }: BoldNameFieldProps) => {
  const record = useRecordContext() as RRoom
  if (!record) return null
  
  return (
    <span style={{ fontWeight: record.id === selectedId ? 'bold' : 'normal' }}>
      {record[source]}
    </span>
  )
}

const NotOwnerDropdown = ({ source, reference }: { source: string; reference: string }) => {
  const users: RUser[] = useGetList<RUser>('users')?.data || []
  const nonAdminUsers = users.filter(user => user.id !== 'admin')
  return (
    <ReferenceArrayInput source={source} reference={reference}>
      <AutocompleteArrayInput helperText="Admin user already has access to all channels" source={source} optionText="name" optionValue="id" choices={nonAdminUsers}/>
    </ReferenceArrayInput>
  )
}

const RoomSpecifics = () => {
  const record = useRecordContext() as RRoom
  const roomTypes = roomTypeFactory.list()
  const roomTypeNames = roomTypes.map((roomType) => ({ name: roomType.label, id: roomType.id }))
  const details = record.details as RoomDetails
  const roomType = details?.specifics?.roomType || 'chat' // Default to chat if no room type
  console.log('room type', roomType, details)
  // Get strategy from factory
  const strategy = roomTypeFactory.get(roomType)
  
  // We need to handle the component rendering in a type-safe way
  // This is a bit complex due to the generic nature of the components
  const renderStrategyComponent = () => {
    if (!strategy) return null
    
    // We need to handle each room type specifically to maintain type safety
    switch (roomType) {
      case 'chat': {
        // For chat rooms - we know this is a ChatRoomStrategy
        // Using type assertion here, but to a specific type rather than 'any'
        const chatStrategy = strategy as RoomTypeStrategy<ChatRoomConfig>
        const EditComponent = chatStrategy.getEditComponent()
        return (
          <EditComponent 
            config={details.specifics as ChatRoomConfig}
            onChange={(newConfig: ChatRoomConfig) => {
              console.log('new chat config', newConfig)
              // Here you would update the record with the new config
            }} 
          />
        )
      }
      case 'form': {
        // For form rooms - we know this is a StructuredMessagingStrategy
        // Using type assertion here, but to a specific type rather than 'any'
        const formStrategy = strategy as RoomTypeStrategy<FormRoomConfig>
        const EditComponent = formStrategy.getEditComponent()
        return (
          <EditComponent 
            config={details.specifics as FormRoomConfig}
            onChange={(newConfig: FormRoomConfig) => {
              console.log('new form config', newConfig)
              // Here you would update the record with the new config
            }} 
          />
        )
      }
      default:
        return null
    }
  }
  
  return (
    <>
      <TextInput source="details.description" label="Description" />
      <Box component='fieldset'>
        <legend>Custom room properties</legend>
        <SelectInput source="details.roomType" label="Room Type" choices={roomTypeNames} />
        {renderStrategyComponent()}
      </Box>
    </>
  )
}

export const EditRoom = ({ id }: { id?: string }) => {
  return (
    <Edit title='> Edit room' id={id} mutationMode='pessimistic' undoable={false}>
      <SimpleForm>
        <TextInput helperText="id values cannot be changed" source="id" />
        <TextInput source="name" />
        <RoomSpecifics />
        <NotOwnerDropdown source="members" reference="users" />
        <ReferenceArrayInput source="memberForces" reference="groups">
          <AutocompleteArrayInput optionText="id" />          
        </ReferenceArrayInput>  
        <BooleanInput helperText="Public rooms are visible to all users" source="public" />    
      </SimpleForm>
    </Edit>
  )
}

export const CreateRoom = ({ embedded = false }: { embedded?: boolean }) => (
  <Create
    title='> Create new room'
    mutationOptions={{
      onSuccess: () => {
        // When embedded is true, don't navigate away
        return embedded ? false : undefined
      }
    }}
  >
    <SimpleForm toolbar={<Toolbar><SaveButton label='Create' alwaysEnable /></Toolbar>}>
      <TextInput source="id" />
      <TextInput source="name" />
      <TextInput source="description" />
      <NotOwnerDropdown source="members" reference="users" />
      <ReferenceArrayInput source="memberForces" reference="groups">
        <AutocompleteArrayInput optionText="id" />          
      </ReferenceArrayInput>
      <BooleanInput helperText="Public rooms are visible to all users" source="public" />    
    </SimpleForm>
  </Create>
)

export const ListRoom = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <List>
          <Datagrid
            rowSx={(record) => record.id === selectedRoomId ? { backgroundColor: '#f5f5f5' } : {}}
            rowClick={(id) => {
              setSelectedRoomId(id === selectedRoomId ? null : id as string)
              return false // Prevent default navigation
            }}
          >
            <BoldNameField source="name" selectedId={selectedRoomId} />
            <BooleanField source="public" />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedRoomId ? (
          <EditRoom id={selectedRoomId} />
        ) : (
          <CreateRoom embedded={true} />
        )}
      </div>
    </div>
  )
}
