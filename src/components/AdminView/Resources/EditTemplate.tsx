import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Edit, useRecordContext, useRedirect, useSaveContext } from 'react-admin'
import { Card, Button, Space, Tabs, Input, Alert } from 'antd'
import { RJSFSchema, UiSchema, FieldTemplateProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { withTheme } from '@rjsf/core'
import { Theme as AntdTheme } from '@rjsf/antd'
import { FormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder'
import DraggableContainer from '../../common/DraggableContainer'
import './edit-templates.css'
import { Template } from '../../../types/rooms-d'

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

// Template editor form component
interface TemplateEditorFormProps {
  initialSchema?: RJSFSchema
  initialUiSchema?: UiSchema
}

const TemplateEditorForm = ({ 
  initialSchema, 
  initialUiSchema
}: TemplateEditorFormProps) => {
  const redirect = useRedirect()
  const record = useRecordContext() as Template
  
  // Local state for the form data
  const [schema, setSchema] = useState<RJSFSchema>(initialSchema || { type: 'object', properties: {} })
  const [uiSchema, setUiSchema] = useState<UiSchema>(initialUiSchema || {})

  const [localState, setLocalState] = useState({ schema: record?.schema, uiSchema: record?.uiSchema })
  const { save: saveRecord } = useSaveContext()

  const doSave = useCallback(() => {
    const insertId = { id: record?.id, ...localState }
    if (saveRecord) {
      saveRecord(insertId)
    }
  }, [saveRecord, localState, record])

  const performUpdate = useCallback((schema: RJSFSchema, uiSchema: UiSchema) => {
    const newSchema = JSON.stringify(schema)
    const newUiSchema = JSON.stringify(uiSchema)
    const oldSchema = JSON.stringify(localState?.schema)
    const oldUiSchema = JSON.stringify(localState?.uiSchema)
    
    if (newSchema !== oldSchema || newUiSchema !== oldUiSchema) {
      setLocalState({ schema, uiSchema })
    }
  }, [ localState])
  
  // Propagate changes to parent component
  useEffect(() => {
    performUpdate(schema, uiSchema)
  }, [schema, uiSchema, performUpdate])
  
  // No longer need a save handler as React Admin handles saving

  // Handle cancel
  const handleCancel = useCallback(() => {
    redirect('list', 'templates')
  }, [redirect])


  // No need to check for record anymore as we're getting data from props

  // Visual builder component with isolated state management
  const VisualBuilder = () => {
    // Create a completely separate state for the form builder
    const [formState, setFormState] = useState({
      schema: JSON.stringify(schema),
      uiSchema: JSON.stringify(uiSchema),
      isDirty: false
    })
    
    // Reference to track if component is mounted
    const isMounted = useRef(true)
    
    // Update form state only when parent schema/uiSchema changes and not during editing
    useEffect(() => {
      // Skip if we're in the middle of editing
      if (formState.isDirty) return
      
      const newSchemaStr = JSON.stringify(schema)
      const newUiSchemaStr = JSON.stringify(uiSchema)
      
      // Only update if the values are actually different
      if (newSchemaStr !== formState.schema || newUiSchemaStr !== formState.uiSchema) {
        setFormState({
          schema: newSchemaStr,
          uiSchema: newUiSchemaStr,
          isDirty: false
        })
      }
      // We need schema and uiSchema in the dependency array to detect external changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState.isDirty, formState.schema, formState.uiSchema])
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMounted.current = false
      }
    }, [])
    
    // Apply changes to parent state when user is done editing
    const applyChanges = useCallback(() => {
      try {
        const parsedSchema = JSON.parse(formState.schema)
        const parsedUiSchema = JSON.parse(formState.uiSchema)
        
        setSchema(parsedSchema)
        setUiSchema(parsedUiSchema)
        
        // Mark as clean after applying changes
        if (isMounted.current) {
          setFormState(prev => ({ ...prev, isDirty: false }))
        }
      } catch (error) {
        console.error('Error applying changes:', error)
      }
    }, [formState.schema, formState.uiSchema])
    
    // Debounced apply changes to reduce updates while typing
    useEffect(() => {
      if (!formState.isDirty) return
      
      const timer = setTimeout(() => {
        applyChanges()
      }, 1000) // 1 second debounce
      
      return () => clearTimeout(timer)
    }, [formState.isDirty, applyChanges])
    
    // Handle form builder changes - only update local state
    const handleFormChange = useCallback((newSchema: string, newUiSchema: string) => {
      setFormState({
        schema: newSchema,
        uiSchema: newUiSchema,
        isDirty: true
      })
    }, [])
    
    return (
      <div style={{ height: '60%' }}>
        <FormBuilder
          className='form-builder'
          schema={formState.schema}
          uischema={formState.uiSchema}
          onChange={handleFormChange}
          mods={{
            customFormInputs: {}
          }}
        />
      </div>
    )
  }

  // Manual JSON editor component
  const ManualEditor = () => {
    const [schemaText, setSchemaText] = useState(JSON.stringify(schema, null, 2))
    const [uiSchemaText, setUiSchemaText] = useState(JSON.stringify(uiSchema, null, 2))
    const [schemaError, setSchemaError] = useState('')
    const [uiSchemaError, setUiSchemaError] = useState('')

    // Initialize text values once
    useEffect(() => {
      setSchemaText(JSON.stringify(schema, null, 2))
      setUiSchemaText(JSON.stringify(uiSchema, null, 2))
    }, [])

    // Update schema only when input loses focus or on manual apply
    const applySchemaChanges = useCallback(() => {
      try {
        const parsed = JSON.parse(schemaText)
        setSchema(parsed)
        setSchemaError('')
      } catch (error) {
        setSchemaError('Invalid JSON: ' + (error as Error).message)
      }
    }, [schemaText])

    // Update uiSchema only when input loses focus or on manual apply
    const applyUiSchemaChanges = useCallback(() => {
      try {
        const parsed = JSON.parse(uiSchemaText)
        setUiSchema(parsed)
        setUiSchemaError('')
      } catch (error) {
        setUiSchemaError('Invalid JSON: ' + (error as Error).message)
      }
    }, [uiSchemaText])

    // Handle schema text changes - only update local state
    const handleSchemaChange = (value: string) => {
      setSchemaText(value)
    }

    // Handle uiSchema text changes - only update local state
    const handleUiSchemaChange = (value: string) => {
      setUiSchemaText(value)
    }

    // Define styles for consistency
    const textAreaContainerStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      height: 'calc(100% - 40px)' // Leave space for button
    }
    
    const textAreaStyle = {
      fontFamily: 'monospace',
      height: '300px', // Taller initial height
      resize: 'vertical' as const, // Allow vertical resizing
      minHeight: '200px' // Ensure a minimum height
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        <Card
          title="JSON Schema"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ padding: '12px', overflow: 'visible' }}
        >
          {schemaError && <Alert message={schemaError} type="error" style={{ marginBottom: '12px' }} />}
          <div style={textAreaContainerStyle}>
            <Input.TextArea
              value={schemaText}
              onChange={(e) => handleSchemaChange(e.target.value)}
              onBlur={applySchemaChanges}
              style={textAreaStyle}
            />
          </div>
          <div style={{ marginTop: '8px' }}>
            <Button size='small' onClick={applySchemaChanges}>Apply Changes</Button>
          </div>
        </Card>
        <Card
          title="UI Schema"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '16px' }}
          bodyStyle={{ padding: '12px', overflow: 'visible' }}
        >
          {uiSchemaError && <Alert message={uiSchemaError} type="error" style={{ marginBottom: '12px' }} />}
          <div style={textAreaContainerStyle}>
            <Input.TextArea
              value={uiSchemaText}
              onChange={(e) => handleUiSchemaChange(e.target.value)}
              onBlur={applyUiSchemaChanges}
              style={textAreaStyle}
            />
          </div>
          <div style={{ marginTop: '8px' }}>
            <Button size='small' onClick={applyUiSchemaChanges}>Apply Changes</Button>
          </div>
        </Card>
      </div>
    )
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
                <Button type='primary' onClick={() => doSave()}>Save</Button>
              </Space>
            }
            bodyStyle={{ flex: 1, overflow: 'auto' }}
          >
            <Tabs
              defaultActiveKey="builder"
              items={[
                {
                  key: 'builder',
                  label: 'Visual Builder',
                  children: <VisualBuilder />
                },
                {
                  key: 'manual',
                  label: 'Manual JSON',
                  children: <ManualEditor />
                }
              ]}
              style={{ height: '100%' }}
            />
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

// This component will be rendered inside the Edit context
const EditForm: React.FC = () => {
  const record = useRecordContext() as Template
  if (!record) {
    return null
  }

  return (
    <div data-testid="edit-form">
      <TemplateEditorForm 
        initialSchema={record.schema} 
        initialUiSchema={record.uiSchema}
      />
    </div>
  )
}

// Main edit template component that wraps the form with the Edit component
export const EditTemplate = () => {
  
  return (
    <Edit 
      title="Edit Template" 
      redirect="list"
      component="div"
      mutationMode="pessimistic"
    >
      <EditForm/>
    </Edit>
  )
}

export default EditTemplate
