import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react' // Add createContext, useContext
import { Edit, useRecordContext, useRedirect, useNotify, useSaveContext } from 'react-admin'
import { Card, Tabs, Button as AntButton, Space as AntSpace, type TabsProps } from 'antd' // Renamed Button and Space, Added TabsProps
// const { TabPane } = Tabs; // No longer needed

// 1. Define TemplateFormActionsContext and EditTemplateActions
interface IFormActions {
  doSave?: () => void;
  handleCancel?: () => void;
}
const TemplateFormActionsContext = createContext<IFormActions>({});

const EditTemplateActions = () => {
  const { doSave, handleCancel } = useContext(TemplateFormActionsContext);
  // Note: The save button here in react-admin's TopToolbar by default uses react-admin's own save mechanism.
  // We are overriding it to call our custom doSave.
  // If `doSave` itself calls react-admin's `save` from `useSaveContext`, it should work.
  // The `useSaveContext` provides a `saving` boolean, which could be useful here.
  // For now, let's keep it simple as per instructions.
  
  // Retrieve the saving state from useSaveContext to disable the button during save
  // This part is an enhancement but good for UX. It assumes EditTemplateActions is rendered within SaveContextProvider
  const { saving } = useSaveContext();


  return (
    <AntSpace>
      <AntButton onClick={handleCancel} disabled={!handleCancel || saving}>Cancel</AntButton>
      <AntButton type="primary" onClick={doSave} disabled={!doSave || saving}>Save</AntButton>
    </AntSpace>
  );
};
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
// 2. Modify TemplateEditorForm
interface TemplateEditorFormProps {
  schema: RJSFSchema; // Changed from initialSchema
  uiSchema: UiSchema; // Changed from initialUiSchema
  setSchema: (schema: RJSFSchema) => void;
  setUiSchema: (uiSchema: UiSchema) => void;
}

const TemplateEditorForm = ({ 
  schema, 
  uiSchema,
  setSchema,
  setUiSchema
}: TemplateEditorFormProps) => {
  // Removed hooks: useRedirect, useNotify, useRecordContext, useSaveContext
  // Removed state: localState
  // Removed functions: doSave, handleCancel, performUpdate
  // Removed useEffect for performUpdate
  
  const [schemaError, setSchemaError] = useState<string | null>(null); // Keep local error state for textareas
  const [uiSchemaError, setUiSchemaError] = useState<string | null>(null); // Keep local error state for textareas
  
  // notify is not available here anymore, direct console log for now or pass down if needed.
  // const notify = useNotify(); 

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Builder',
      style: { height: '100%', display: 'flex', flexDirection: 'column' }, // Apply style to item if needed, or ensure content fills
      children: (
        <Card 
          title="Form Builder" 
          style={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }} 
          styles={{ body: { flex: 1, overflow: 'auto' } }} // Updated bodyStyle
        >
          <div style={{ height: '100%' }}> {/* Ensure FormBuilder container takes full height */}
            <FormBuilder
              className='form-builder' // Ensure this class allows height: 100% if needed
              schema={schema ? JSON.stringify(schema) : "{}"}
              uischema={uiSchema ? JSON.stringify(uiSchema) : "{}"}
              onChange={(newSchemaString: string, newUiSchemaString: string) => {
                try {
                  setSchema(JSON.parse(newSchemaString));
                  setUiSchema(JSON.parse(newUiSchemaString));
                  setSchemaError(null); 
                  setUiSchemaError(null);
                } catch (error) {
                  console.error('Error parsing schema from FormBuilder:', error);
                }
              }}
              mods={{
                customFormInputs: {}
              }}
            />
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Manual',
      style: { height: '100%', display: 'flex', flexDirection: 'column' }, // Apply style to item
      children: (
        <Card 
          title="Manual Edit" 
          style={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }} 
          styles={{ body: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' } }} // Updated bodyStyle
        >
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <h3>JSON Schema</h3>
              <textarea
                style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', flexGrow: 1, border: schemaError ? '1px solid red' : undefined }}
                value={schema ? JSON.stringify(schema, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const newSchema = JSON.parse(e.target.value);
                    setSchema(newSchema);
                    setSchemaError(null);
                  } catch (err) {
                    console.error("Error parsing schema JSON:", err);
                    setSchemaError("Invalid JSON format");
                  }
                }}
              />
              {schemaError && (
                <div style={{ color: 'red', marginTop: '4px', fontSize: '0.9em' }}>
                  {schemaError}
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3>UI Schema</h3>
              <textarea
                style={{ width: '100%', minHeight: '150px', fontFamily: 'monospace', flexGrow: 1, border: uiSchemaError ? '1px solid red' : undefined }}
                value={uiSchema ? JSON.stringify(uiSchema, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const newUiSchema = JSON.parse(e.target.value);
                    setUiSchema(newUiSchema);
                    setUiSchemaError(null);
                  } catch (err) {
                    console.error("Error parsing uiSchema JSON:", err);
                    setUiSchemaError("Invalid JSON format");
                  }
                }}
              />
              {uiSchemaError && (
                <div style={{ color: 'red', marginTop: '4px', fontSize: '0.9em' }}>
                  {uiSchemaError}
                </div>
              )}
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <DraggableContainer
      initialLeftPanelWidth={50} 
      leftPanel={
        <Tabs 
          defaultActiveKey="1" 
          items={tabItems} 
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }} 
          // The Tab component itself might need `destroyInactiveTabPane` if content height is an issue between tab switches
          // or ensure child items correctly manage their height (flexGrow: 1 on Card within tab item's children)
        />
      }
      rightPanel={
        <Card 
          title="Live Preview" 
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }} 
          styles={{ body: { flex: 1, overflow: 'auto' } }} // Updated bodyStyle
        >
          <FormPreview 
            schema={schema} 
            uiSchema={uiSchema}
          />
        </Card>
      }
    />
  )
}

// 3. Modify EditForm
const EditForm: React.FC = () => {
  const record = useRecordContext<Template>();
  const redirect = useRedirect();
  const notify = useNotify();
  const { save } = useSaveContext();

  // Define state for schema and uiSchema
  const [schema, setSchema] = useState<RJSFSchema>({ type: 'object', title: 'New Form', properties: {} });
  const [uiSchema, setUiSchema] = useState<UiSchema>({});

  // Effect to initialize/update schema and uiSchema when record is loaded/changed
  useEffect(() => {
    if (record) {
      setSchema(record.schema || { type: 'object', title: 'New Form', properties: {} });
      setUiSchema(record.uiSchema || {});
    }
  }, [record]);

  const handleCancel = useCallback(() => {
    redirect('list', 'templates');
  }, [redirect]);

  const doSave = useCallback(() => {
    if (!record) {
      notify("Cannot save: record not loaded.", { type: 'error' });
      return;
    }
    // Ensure schema and uiSchema are not undefined before saving.
    // This should be handled by initializing them properly.
    const dataToSave = { 
      id: record.id, 
      schema: schema || { type: 'object', properties: {} }, 
      uiSchema: uiSchema || {} 
    };
    // notify('Saving template...', { type: 'info' }); // React Admin handles this with optimistic/pessimistic mode
    if (save) {
      save(dataToSave);
    }
  }, [record, schema, uiSchema, save, notify]);

  if (!record) {
    // Still loading or record is not found
    return null; 
  }

  return (
    <TemplateFormActionsContext.Provider value={{ doSave, handleCancel }}>
      <div data-testid="edit-form">
        <TemplateEditorForm 
          schema={schema} // Pass schema state
          uiSchema={uiSchema} // Pass uiSchema state
          setSchema={setSchema} // Pass setter
          setUiSchema={setUiSchema} // Pass setter
        />
      </div>
    </TemplateFormActionsContext.Provider>
  );
}

// Main edit template component that wraps the form with the Edit component
export const EditTemplate = () => {
  
  return (
    <Edit 
      title="Edit Template" 
      redirect="list"
      // component="div" // Removed as it might interfere with actions rendering
      mutationMode="pessimistic"
      actions={<EditTemplateActions />} // 3. Use EditTemplateActions
    >
      <EditForm />
    </Edit>
  )
}

export default EditTemplate
