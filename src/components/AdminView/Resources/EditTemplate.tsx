import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, useRecordContext, useNotify, useRedirect, SaveButton, Toolbar } from 'react-admin'
import { Card, Button, Space } from 'antd'
import { RJSFSchema, UiSchema, FieldTemplateProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { withTheme } from '@rjsf/core'
import { Theme as AntdTheme } from '@rjsf/antd'
import { FormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder'
import DraggableContainer from '../../common/DraggableContainer'
import './templates.css'

// Create the Ant Design themed form
const Form = withTheme(AntdTheme)

// Custom toolbar that only shows the save button
const EditToolbar = (props: { onSave?: () => void }) => (
  <Toolbar {...props}>
    <SaveButton onClick={props.onSave} />
  </Toolbar>
)

// Form preview component that uses the current edit state
const FormPreview = ({ schema, uiSchema }: { schema: RJSFSchema, uiSchema: UiSchema }) => {
  // Create a merged UI schema with Ant Design specific options
  const enhancedUiSchema = {
    ...uiSchema,
    'ui:submitButtonOptions': {
      props: {
        className: 'ant-btn ant-btn-primary'
      },
      norender: false,
    }
  }

  const name = useMemo(() => {
    const record = schema.title || 'unnamed'
    return record
  }, [schema])

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
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Form Preview - {name}</h3>
      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Form
          schema={schema}
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

// Template editor form component that uses the record context
const TemplateEditorForm = ({ registerSaveHandler }: { registerSaveHandler: (saveHandler: () => void) => void }) => {
  const record = useRecordContext()
  const notify = useNotify()
  const redirect = useRedirect()
  
  const [schema, setSchema] = useState<RJSFSchema>({ type: 'object', properties: {} })
  const [uiSchema, setUiSchema] = useState<UiSchema>({})

  // Custom save function wrapped in useCallback to prevent recreation on every render
  const handleSave = useCallback(() => {
    // The save will be handled by react-admin
    // We're just updating the record context with our edited values
    if (record) {
      record.schema = schema
      record.uiSchema = uiSchema
    } 
    
    notify('Template saved successfully', { type: 'success' })
    
    // After save, redirect to the list view
    redirect('list', 'templates')
  }, [record, schema, uiSchema, notify, redirect])

  // Initialize form state from record
  useEffect(() => {
    if (record) {
      // Ensure schema has required structure for form builder
      const initialSchema = record.schema || { type: 'object', properties: {} }
      if (!initialSchema.type) {
        initialSchema.type = 'object'
      }
      if (!initialSchema.properties) {
        initialSchema.properties = {}
      }
      
      setSchema(initialSchema)
      setUiSchema(record.uiSchema || {})
    }
  }, [record])
  
  // Register the save handler with the parent component
  useEffect(() => {
    registerSaveHandler(handleSave)
  }, [registerSaveHandler, handleSave])

  // Handle cancel
  const handleCancel = () => {
    redirect('list', 'templates')
  }

  if (!record) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>      
      <DraggableContainer
        initialLeftPanelWidth={50}
        leftPanel={
          <Card
            title="Form Builder"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            extra={
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button 
                  type="primary"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Space>
            }
            bodyStyle={{ flex: 1, overflow: 'auto' }}
          >
            <div style={{ height: '100%' }}>
              <FormBuilder
                schema={JSON.stringify(schema)}
                uischema={JSON.stringify(uiSchema)}
                onChange={(newSchema: string, newUiSchema: string) => {
                  try {
                    setSchema(JSON.parse(newSchema))
                    setUiSchema(JSON.parse(newUiSchema))
                  } catch (error) {
                    console.error('Error parsing schema:', error)
                  }
                }}
                mods={{
                  customFormInputs: {}
                }}
              />
            </div>
          </Card>
        }
        rightPanel={
          <Card 
            title="Live Preview"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'auto' }}
          >
            <FormPreview 
              schema={schema} 
              uiSchema={uiSchema}
            />
          </Card>
        }
      />
    </div>
  )
}

// Main edit template component that wraps the form with the Edit component
export const EditTemplate = () => {
  // Create a ref to store the save function from the child component
  const saveRef = useRef<(() => void) | null>(null)
  
  // Handler for the save button in the toolbar
  const handleSave = () => {
    if (saveRef.current) {
      saveRef.current()
    }
  }
  
  // Function to register the save handler from the child component
  const registerSaveHandler = (saveHandler: () => void) => {
    saveRef.current = saveHandler
  }
  
  return (
    <Edit 
      title="Edit Template" 
      redirect="list"
      component="div"
      actions={false}
      toolbar={<EditToolbar onSave={handleSave} />}
    >
      <TemplateEditorForm registerSaveHandler={registerSaveHandler} />
    </Edit>
  )
}

export default EditTemplate
