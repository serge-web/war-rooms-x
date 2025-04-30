import { Datagrid, List, Show, SimpleShowLayout, TextField, useRecordContext } from 'react-admin'
import { useState } from 'react'
import Form from '@rjsf/core'
import { RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

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

// Form preview component that uses useRecordContext
const FormPreview = () => {
  const record = useRecordContext()
  if (!record) return null
  
  return (
    <div style={{ marginTop: '1rem', border: '1px solid #eee', padding: '1.5rem', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Form Preview - {record.name}</h3>
      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Form
          schema={record.schema as RJSFSchema}
          uiSchema={record.uiSchema}
          validator={validator}
          onSubmit={(e) => {
            console.log('Form submitted with data:', e.formData)
          }}
          formData={{}}
          liveValidate
        />
      </div>
    </div>
  )
}

export const ShowTemplates = ({ id }: { id?: string }) => {
  // Return early if no id is provided
  if (!id) return null
  
  return (
    <Show title='> Template details' id={id}>
      <SimpleShowLayout>
        <FormPreview />
      </SimpleShowLayout>
    </Show>
  )
}

export const ListTemplates: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: '1' }}>
        <List>
          <Datagrid
            rowSx={(record) => record.id === selectedTemplateId ? { backgroundColor: '#f5f5f5' } : {}}
            rowClick={(id) => {
              setSelectedTemplateId(id === selectedTemplateId ? null : id as string)
              return false // Prevent default navigation
            }}
          >
            <BoldNameField source='name' selectedId={selectedTemplateId} />
            <TextField source='id' />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedTemplateId && (
          <ShowTemplates id={selectedTemplateId} />
        )}
      </div>
    </div>
  )
}