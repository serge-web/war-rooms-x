import { Datagrid, List, Show, SimpleShowLayout, TextField, useRecordContext, EditButton, TopToolbar, Create, SimpleForm, TextInput } from 'react-admin'
import React, { useState } from 'react'
import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { withTheme } from '@rjsf/core'
import { Theme as AntdTheme } from '@rjsf/antd'
import './templates.css'

// Create the Ant Design themed form
const Form = withTheme(AntdTheme)

interface BoldNameFieldProps {
  selectedId: string | null
}

const BoldNameField = ({ selectedId }: BoldNameFieldProps) => {
  const record = useRecordContext()
  if (!record) return null
  
  return (
    <span style={{ fontWeight: record.id === selectedId ? 'bold' : 'normal' }}>
      {record.schema.title || 'Pending'}
    </span>
  )
}

// Form preview component that uses useRecordContext
const FormPreview = () => {
  const record = useRecordContext()
  if (!record) return null
  
  // Create a merged UI schema with Ant Design specific options
  const enhancedUiSchema = {
    ...record.uiSchema,
    'ui:submitButtonOptions': {
      props: {
        className: 'ant-btn ant-btn-primary'
      },
      norender: false,
    }
  }

  function CustomFieldTemplate(props: FieldTemplateProps) {
    const { id, label, children } = props
    const isRoot = id === 'root'
    
    // Root level container gets special treatment
    if (isRoot) {
      return (
        <div className='form-item root-item' id={id}>
          <div className='root-form-container'>{children}</div>
        </div>
      )
    }

    // Standard field with label on the left
    return (
      <div className='form-item' id={id}>
        <label htmlFor={id}>{label}</label>
        <div className='field-container'>{children}</div>
      </div>
    )
  }
  
  return (
    <div style={{ marginTop: '1rem', border: '1px solid #eee', padding: '1.5rem', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Form Preview - {record.name}</h3>
      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Form
          schema={record.schema as RJSFSchema}
          uiSchema={enhancedUiSchema}
          validator={validator}
          formData={{}}
          liveValidate
          className='ant-form ant-form-horizontal'
          children={null} // hide the submit button
          templates={{ FieldTemplate: CustomFieldTemplate }}
        />
      </div>
    </div>
  )
}

const TemplateShowActions = ({ id }: { id?: string }) => {
  // Only render if we have a valid ID
  if (!id) return null
  
  return (
    <TopToolbar>
      <EditButton record={{ id }} />
    </TopToolbar>
  )
}

export const ShowTemplates = ({ id }: { id?: string }) => {
  // Return early if no id is provided
  if (!id) return null
  
  return (
    <Show 
      title='> Template details' 
      id={id as string}
      actions={<TemplateShowActions id={id} />}
    >
      <SimpleShowLayout>
        <FormPreview />
      </SimpleShowLayout>
    </Show>
  )
}

export const CreateTemplates: React.FC = () => {
  const transform = (data: { id: string, name: string }) => {
    const res = { 
      id: data.id, schema: { title: data.name, type: 'object', properties: {} }, uiSchema: {}
    }
    console.log('storing', res)
    return res
  }
  return (
    <Create title=" - Create new template" transform={transform}>
      <SimpleForm>
        <TextInput source="id" />
        <TextInput source="name" />
      </SimpleForm>
    </Create>
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
            <BoldNameField selectedId={selectedTemplateId} />
            <TextField source='id' />
            <EditButton />
          </Datagrid>
        </List>
      </div>
      <div style={{ flex: '1', marginLeft: '1rem' }}>
        {selectedTemplateId ? (
          <ShowTemplates id={selectedTemplateId} />
        ) : <CreateTemplates />}
      </div>
    </div>
  )
}