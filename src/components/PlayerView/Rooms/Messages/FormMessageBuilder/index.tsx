import React, { useState, useEffect } from 'react'
import './index.css'
import { Button, Select } from 'antd'
import { MessageDetails, Template } from '../../../../../types/rooms-d'
import { withTheme } from '@rjsf/core'
import { Theme as AntdTheme } from '@rjsf/antd'
import validator from '@rjsf/validator-ajv8'
import { FieldTemplateProps } from '@rjsf/utils'

// Create the Ant Design themed form
const Form = withTheme(AntdTheme)

interface FormMessageBuilderProps {
  onSendMessage: (messageType: MessageDetails['messageType'], content: object) => void
  disabled: boolean
  templates: Template[] | undefined
}

const FormMessageBuilder: React.FC<FormMessageBuilderProps> = ({ 
  onSendMessage, 
  disabled, 
  templates 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<object>({})

  // Select the first template by default when templates are loaded or changed
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0])
    }
  }, [templates, selectedTemplate])

  // Custom field template for horizontal layout with labels on the left
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

  const handleSubmit = () => {
    if (selectedTemplate && formData) {
      // Use 'chat' as the messageType since that's what the API expects
      onSendMessage('chat', {
        templateId: selectedTemplate.id,
        formData
      })
      // Reset form after submission
      setFormData({})
    }
  }

  // Define a type for the form change event
  interface FormChangeEvent {
    formData?: object
    errors?: Array<object>
    errorSchema?: object
  }

  const handleChange = (data: FormChangeEvent) => {
    if (data && data.formData) {
      setFormData(data.formData)
    }
  }

  // If no templates are available, show a message
  if (!templates || templates.length === 0) {
    return (
      <div className='form-message-builder'>
        <p>No templates available for this room.</p>
      </div>
    )
  }

  return (
    <div className='form-message-builder'>
      <div className='template-selector'>
        <label>Select Template:</label>
        <Select
          placeholder='Choose a template'
          disabled={disabled}
          style={{ width: '100%' }}
          onChange={(value) => {
            const template = templates.find(t => t.id === value)
            setSelectedTemplate(template || null)
            setFormData({})
          }}
          value={selectedTemplate?.id}
          options={templates.map(template => ({
            value: template.id,
            label: template.schema.title || template.id
          }))}
        />
      </div>
      
      {selectedTemplate && (
        <div className='form-container'>
          <Form
            schema={selectedTemplate.schema}
            uiSchema={selectedTemplate.uiSchema || {}}
            validator={validator}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            templates={{ FieldTemplate: CustomFieldTemplate }}
          >
            <div className='form-actions'>
              <Button 
                type='primary' 
                onClick={handleSubmit} 
                disabled={disabled}
              >
                Send
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  )
}

export default FormMessageBuilder
