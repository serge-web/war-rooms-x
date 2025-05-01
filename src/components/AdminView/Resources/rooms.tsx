import { AutocompleteArrayInput, BooleanField, BooleanInput, Create, Datagrid, Edit, List, ReferenceArrayInput, SaveButton, SimpleForm, TextInput, Toolbar, useGetList, useRecordContext } from 'react-admin';
import { RRoom, RUser } from '../raTypes-d';
import { useState } from 'react';

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
  console.log('room description UI', record.description)
  return (
    <>
      <TextInput source="description" />
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
