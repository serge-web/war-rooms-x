import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, useRecordContext, useRedirect } from 'react-admin'
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

// We don't need a custom toolbar anymore as we're using React Admin's default save mechanism

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

// Template editor form component
interface TemplateEditorFormProps {
  initialSchema?: RJSFSchema
  initialUiSchema?: UiSchema
  onChange: (schema: RJSFSchema, uiSchema: UiSchema) => void
}

const TemplateEditorForm = ({ 
  initialSchema, 
  initialUiSchema, 
  onChange
}: TemplateEditorFormProps) => {
  const redirect = useRedirect()
  
  // Local state for the form data
  const [schema, setSchema] = useState<RJSFSchema>({ type: 'object', properties: {} })
  const [uiSchema, setUiSchema] = useState<UiSchema>({})

  // Initialize form state from props
  useEffect(() => {
    if (initialSchema) {
      // Ensure schema has required structure for form builder
      const processedSchema = { ...initialSchema }
      if (!processedSchema.type) {
        processedSchema.type = 'object'
      }
      if (!processedSchema.properties) {
        processedSchema.properties = {}
      }
      
      setSchema(processedSchema)
      setUiSchema(initialUiSchema || {})
    }
  }, [initialSchema, initialUiSchema])
  
  // Propagate changes to parent component
  useEffect(() => {
    onChange(schema, uiSchema)
  }, [schema, uiSchema, onChange])
  
  // No longer need a save handler as React Admin handles saving

  // Handle cancel
  const handleCancel = useCallback(() => {
    redirect('list', 'templates')
  }, [redirect])

  // No need to check for record anymore as we're getting data from props

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
  // This component will be rendered inside the Edit context
  const EditForm = () => {
    const record = useRecordContext()
    const [formData, setFormData] = useState<{ schema: RJSFSchema, uiSchema: UiSchema }>({ 
      schema: record?.schema || { type: 'object', properties: {} }, 
      uiSchema: record?.uiSchema || {} 
    })
    
    // Initialize form data from record when it changes
    useEffect(() => {
      if (record) {
        setFormData({
          schema: record.schema || { type: 'object', properties: {} },
          uiSchema: record.uiSchema || {}
        })
      }
    }, [record])
    
    // We'll use the formData directly in the save process
    
    // Handle form data changes
    const handleFormChange = useCallback((schema: RJSFSchema, uiSchema: UiSchema) => {
      setFormData({ schema, uiSchema })
    }, [])
    
    return (
      <div data-testid="edit-form">
        {/* Store the current form data in a data attribute for the transform function */}
        <div 
          style={{ display: 'none' }} 
          data-form-data={JSON.stringify(formData)}
        />
        <TemplateEditorForm 
          initialSchema={record?.schema} 
          initialUiSchema={record?.uiSchema}
          onChange={handleFormChange}
        />
      </div>
    )
  }
  
  return (
    <Edit 
      title="Edit Template" 
      redirect="list"
      component="div"
      actions={false}
      transform={(data) => {
        // This is called by React Admin before saving
        // Find the EditForm component's formData and merge it with the data
        const editForm = document.querySelector('[data-testid="edit-form"]')
        if (editForm && editForm.__reactProps$) {
          // Access the formData through the DOM (not ideal but works as a fallback)
          const formDataElement = editForm.querySelector('[data-form-data]')
          if (formDataElement && formDataElement.dataset.formData) {
            try {
              const formData = JSON.parse(formDataElement.dataset.formData)
              return {
                ...data,
                schema: formData.schema,
                uiSchema: formData.uiSchema
              }
            } catch (e) {
              console.error('Error parsing form data:', e)
            }
          }
        }
        return data
      }}
    >
      <EditForm />
    </Edit>
  )
}

export default EditTemplate
