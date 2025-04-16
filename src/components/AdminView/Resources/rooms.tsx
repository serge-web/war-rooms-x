import { AutocompleteArrayInput, Create, Datagrid, Edit, List, ReferenceArrayField, ReferenceArrayInput, SaveButton, Show, SimpleForm, SimpleShowLayout, TextField, TextInput, Toolbar, useGetList, useRecordContext } from 'react-admin';
import { RUser } from '../raTypes-d';
import { useState } from 'react';

interface BoldNameFieldProps {
  source: string
  selectedId: string | null
}

const BoldNameField = ({ source, selectedId }: BoldNameFieldProps) => {
  const record = useRecordContext()
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

export const RoomEdit = ({ id }: { id?: string }) => {
  return (
    <Edit id={id} mutationMode='pessimistic' undoable={false}>
      <SimpleForm>
        <TextInput source="id" />
        <TextInput source="name" />
        <TextInput source="description" />
        <NotOwnerDropdown source="members" reference="users" />
        <ReferenceArrayInput source="memberForces" reference="groups">
          <AutocompleteArrayInput optionText="id" />          
        </ReferenceArrayInput>      
      </SimpleForm>
    </Edit>
  )
}

export const RoomCreate = ({ embedded = false }: { embedded?: boolean }) => (
  <Create
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
    </SimpleForm>
  </Create>
)

export const RoomList = () => {
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
            <TextField source="id" />
            <BoldNameField source="name" selectedId={selectedRoomId} />
            <TextField source="description" />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedRoomId ? (
          <RoomEdit id={selectedRoomId} />
        ) : (
          <RoomCreate embedded={true} />
        )}
      </div>
    </div>
  )
}

export const RoomShow = () => (
  <Show>
      <SimpleShowLayout>
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="description" />
          <ReferenceArrayField source="members" reference="users"/>
          <ReferenceArrayField source="memberForces" reference="groups"/>
      </SimpleShowLayout>
  </Show>
)