import { Create, Datagrid, Edit, List, SimpleForm, TextField, TextInput, ReferenceArrayInput, AutocompleteArrayInput, SaveButton, Toolbar, useRecordContext, useInput } from 'react-admin'
import { useState } from 'react'

interface BoldDescriptionFieldProps {
  source: string
  selectedId: string | null
}

// Reusable ColorPicker component for react-admin forms
interface ColorPickerProps {
  source: string
  label?: string
  [key: string]: unknown
}
const ColorPicker = ({ source, label = 'Color', ...props }: ColorPickerProps) => {
  const {
    field,
    fieldState: { error },
    isRequired
  } = useInput({ source, ...props })
  console.log('new color, value:', source, field.value)
  field.value = field.value || '#0000ff'
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
      <label htmlFor={source} style={{ marginRight: '0.5rem' }}>
        {label}{isRequired ? ' *' : ''}
      </label>
      <input
        id={source}
        type='color'
        {...field}
        style={{ width: 32, height: 32, border: 'none', background: 'none', padding: 0 }}
      />
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error.message}</span>}
    </div>
  )
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
  <Edit title='> Edit force' id={id} undoable={false}>
      <SimpleForm>
          <TextInput helperText="id values cannot be changed" disabled source="id" />
          <TextInput source="description" />
          <TextInput source="objectives" multiline />
          <ColorPicker source='color' label='Color' />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
      </SimpleForm>
  </Edit>
);

export const CreateGroup = ({ embedded = false }: { embedded?: boolean }) => (
  <Create
    title='> Create new force'
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
          <TextInput source="objectives" multiline />
          <ColorPicker source='color' label='Color' />
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
          <Datagrid
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