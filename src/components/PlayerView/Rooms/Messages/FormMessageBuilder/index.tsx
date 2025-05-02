import React, { useState, useEffect } from 'react'
import './index.css'
import { Button, Select } from 'antd'
import { FormMessage, MessageDetails, Template } from '../../../../../types/rooms-d'
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

  const handleSubmit = (data: object) => {
    console.log('about to submit', data)
    if (selectedTemplate && data) {
      // Use 'chat' as the messageType since that's what the API expects
      const message: FormMessage = {
        templateId: selectedTemplate.id,
        data
      }
      onSendMessage('form', message)
      // Reset form after submission
      setFormData({})
      setSelectedTemplate(null)
    }
  }

  // Only update formData when the form is submitted, not on every change
  // This prevents losing focus when typing
  const handleChange = () => {
    // We're intentionally not updating state on every change to prevent focus loss
    // The form will maintain its own internal state until submission
  }

  // If no templates are available, show a message
  if (!templates || templates.length === 0) {
    return (
      <div className='form-message-builder'>
        <p>No templates available for this room.</p>
      </div>
    )
  }

  console.log('builder templates', templates)

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
            liveValidate={true}
            onChange={handleChange}
            onSubmit={(data) => {
              console.log('about to handle submit', data)
              // Update formData state with the final form data when submitting
              if (data.formData) {
                setFormData(data.formData)
                handleSubmit(data.formData)
              }
            }}
            templates={{ FieldTemplate: CustomFieldTemplate }}
          >
            <div className='form-actions'>
              <Button 
                type='primary' 
                htmlType='submit'
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
