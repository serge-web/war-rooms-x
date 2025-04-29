import { Typography } from "antd";
import { Create, Datagrid, Edit, List, SimpleForm, TextField, TextInput, SaveButton, Toolbar, useRecordContext } from "react-admin";
import { useState } from 'react'

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

export const EditUser = ({ id }: { id?: string }) => (
  <Edit title='> Edit role' id={id} undoable={false} mutationMode='pessimistic'>
    <SimpleForm>
      <TextInput helperText="id values cannot be changed" source="id" />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
)

export const CreateUser = ({ embedded = false }: { embedded?: boolean }) => (
  <Create
  title='> Create new role'
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
      <Typography.Paragraph><strong>Note:</strong>Password for new user will be set to `pwd`</Typography.Paragraph>
    </SimpleForm>
  </Create>
);

export const ListUser = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <List>
          <Datagrid
            rowSx={(record) => record.id === selectedUserId ? { backgroundColor: '#f5f5f5' } : {}}
            rowClick={(id) => {
              setSelectedUserId(id === selectedUserId ? null : id as string)
              return false // Prevent default navigation
            }}
          >
            <TextField source="id" />
            <BoldNameField source="name" selectedId={selectedUserId} />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedUserId ? (
          <EditUser id={selectedUserId} />
        ) : <CreateUser embedded={true}/>}
      </div>
    </div>
  )
};

  