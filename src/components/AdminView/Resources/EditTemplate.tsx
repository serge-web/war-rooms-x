import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edit, useRecordContext, useNotify, useRedirect, SaveButton, Toolbar } from 'react-admin'
import { Card, Button, Space } from 'antd'
import { RJSFSchema, UiSchema, FieldTemplateProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { withTheme } from '@rjsf/core'
import { Theme as AntdTheme } from '@rjsf/antd'
import { FormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder'
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
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(50) // percentage
  
  // Refs for draggable divider
  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)

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
      {/* Resizable panels with draggable divider */}
      <div 
        ref={containerRef}
        style={{ 
          display: 'flex', 
          position: 'relative',
          height: 'calc(100vh - 250px)', // Adjust based on your layout
          minHeight: '500px'
        }}
        onMouseUp={() => {
          isDraggingRef.current = false
          document.body.style.cursor = 'default'
        }}
        onMouseMove={(e) => {
          if (!isDraggingRef.current || !containerRef.current) return
          
          const containerRect = containerRef.current.getBoundingClientRect()
          const containerWidth = containerRect.width
          const mouseX = e.clientX - containerRect.left
          
          // Calculate percentage (constrained between 30% and 70%)
          let newLeftWidth = (mouseX / containerWidth) * 100
          newLeftWidth = Math.max(30, Math.min(70, newLeftWidth))
          
          setLeftPanelWidth(newLeftWidth)
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false
          document.body.style.cursor = 'default'
        }}
      >
        {/* Editor Section */}
        <div style={{ 
          width: `${leftPanelWidth}%`, 
          height: '100%',
          overflow: 'hidden',
          transition: isDraggingRef.current ? 'none' : 'width 0.1s ease'
        }}>
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
        </div>
        
        {/* Draggable divider */}
        <div
          ref={dividerRef}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${leftPanelWidth}%`,
            width: '10px',
            transform: 'translateX(-50%)',
            cursor: 'col-resize',
            zIndex: 10,
            transition: isDraggingRef.current ? 'none' : 'left 0.1s ease'
          }}
          onMouseDown={(e) => {
            isDraggingRef.current = true
            document.body.style.cursor = 'col-resize'
            e.preventDefault() // Prevent text selection during drag
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '4px',
              backgroundColor: '#e8e8e8',
              transform: 'translateX(-50%)',
              borderRadius: '2px'
            }}
          />
        </div>
        
        {/* Preview Section */}
        <div style={{ 
          width: `${100 - leftPanelWidth}%`, 
          height: '100%',
          overflow: 'hidden',
          transition: isDraggingRef.current ? 'none' : 'width 0.1s ease'
        }}>
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
        </div>
      </div>
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
