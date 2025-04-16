import { Create, Datagrid, Edit, List, Show, SimpleForm, TextField, TextInput, ReferenceArrayInput, AutocompleteArrayInput, SimpleShowLayout, ReferenceArrayField, SaveButton, Toolbar, useRecordContext } from 'react-admin'
import { useState } from 'react'

interface BoldDescriptionFieldProps {
  source: string
  selectedId: string | null
}

const BoldDescriptionField = ({ source, selectedId }: BoldDescriptionFieldProps) => {
  const record = useRecordContext()
  if (!record) return null
  
  return (
    <span style={{ fontWeight: record.id === selectedId ? 'bold' : 'normal' }}>
      {record[source]}
    </span>
  )
}

export const EditGroup = ({ id }: { id?: string }) => (
  <Edit id={id} undoable={false}>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
      </SimpleForm>
  </Edit>
);

export const ShowGroup = () => (
  <Show>
      <SimpleShowLayout >
          <TextField source="id" />
          <TextField source="description" />
          <ReferenceArrayField source="members" reference="users"/>
      </SimpleShowLayout>
  </Show>
);


export const CreateGroup = ({ embedded = false }: { embedded?: boolean }) => (
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
          <TextInput source="description" />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
      </SimpleForm>
  </Create>
);

export const ListGroup = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <List>
          <Datagrid isRowSelectable={() => false}
            rowSx={(record) => record.id === selectedGroupId ? { backgroundColor: '#f5f5f5' } : {}}
            rowClick={(id) => {
              setSelectedGroupId(id === selectedGroupId ? null : id as string)
              return false // Prevent default navigation
            }}
          >
            <TextField source="id" label="Name" />
            <BoldDescriptionField source="description" selectedId={selectedGroupId} />
          </Datagrid>
        </List>
      </div>
        <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedGroupId ? (
          <EditGroup id={selectedGroupId} />
        ) : <CreateGroup embedded={true}/>}
        </div>
    </div>
  )
}