import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, useRecordContext, useRedirect, useNotify, useSaveContext } from 'react-admin'
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
}

const TemplateEditorForm = ({ 
  initialSchema, 
  initialUiSchema
}: TemplateEditorFormProps) => {
  const redirect = useRedirect()
  const notify = useNotify()
  const record = useRecordContext()
  
  // Local state for the form data
  const [schema, setSchema] = useState<RJSFSchema>(initialSchema || { type: 'object', properties: {} })
  const [uiSchema, setUiSchema] = useState<UiSchema>(initialUiSchema || {})

  const [localState, setLocalState] = useState({ schema: record?.schema, uiSchema: record?.uiSchema })
  const { save } = useSaveContext()

  const doSave = useCallback(() => {
    if (save) {
      save(localState)
    }
  }, [save, localState])

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
                <Button type='primary' onClick={() => {
                  // We don't need to manually save here as React Admin's Edit component
                  // will handle the save action when its save button is clicked
                  notify('Ready to save', { type: 'info' })
                  doSave()
                }}>
                  Save
                </Button>
              </Space>
            }
            bodyStyle={{ flex: 1, overflow: 'auto' }}
          >
            <div style={{ height: '100%' }}>
              <FormBuilder
                className='form-builder'
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

// This component will be rendered inside the Edit context
const EditForm: React.FC = () => {
  const record = useRecordContext()

  return (
    <div data-testid="edit-form">
      <TemplateEditorForm 
        initialSchema={record?.schema} 
        initialUiSchema={record?.uiSchema}
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
