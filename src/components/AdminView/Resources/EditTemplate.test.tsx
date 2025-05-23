import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components for testing.
const ActualModule = jest.requireActual('./EditTemplate');
const EditTemplate = ActualModule.EditTemplate;
const EditTemplateActions = ActualModule.EditTemplateActionsInternalTesting || ActualModule.EditTemplateActions; 
const TemplateEditorForm = ActualModule.TemplateEditorFormInternalTesting || ActualModule.TemplateEditorForm;
const EditForm = ActualModule.EditFormInternalTesting || ActualModule.EditForm;
const TemplateFormActionsContext = ActualModule.TemplateFormActionsContextInternalTesting || ActualModule.TemplateFormActionsContext;

// Mock react-admin hooks
const mockNotify = jest.fn();
const mockRedirect = jest.fn();
const mockSave = jest.fn();
let mockRAUseRecordContext = jest.fn();
let mockSaving = false;

jest.mock('react-admin', () => ({
  ...jest.requireActual('react-admin'),
  useRecordContext: (props: any) => mockRAUseRecordContext(props),
  useNotify: () => mockNotify,
  useRedirect: () => mockRedirect,
  useSaveContext: () => ({ save: mockSave, saving: mockSaving }),
  Edit: ({ children, actions, title }: any) => (
    <div>
      <h1>{title}</h1>
      {actions && <div data-testid="edit-actions-container">{actions}</div>}
      <div>{children}</div>
    </div>
  ),
}));

// Mock FormBuilder
const mockFormBuilderOnChange = jest.fn();
jest.mock('@ginkgo-bioworks/react-json-schema-form-builder', () => ({
  FormBuilder: jest.fn((props) => {
    mockFormBuilderOnChange.mockImplementation((schema, uischema) => props.onChange(schema, uischema));
    return (
      <div data-testid="mock-form-builder">
        <input
          data-testid="mock-fb-schema-input"
          value={props.schema}
          onChange={(e) => props.onChange(e.target.value, props.uischema)}
        />
        <input
          data-testid="mock-fb-uischema-input"
          value={props.uischema}
          onChange={(e) => props.onChange(props.schema, e.target.value)}
        />
      </div>
    );
  }),
}));

// Mock DraggableContainer
jest.mock('../../common/DraggableContainer', () => {
  return jest.fn(({ leftPanel, rightPanel }) => (
    <div data-testid="mock-draggable-container">
      <div data-testid="left-panel">{leftPanel}</div>
      <div data-testid="right-panel">{rightPanel}</div>
    </div>
  ));
});


// Default record for mocking useRecordContext
const initialMockRecord = {
  id: '123',
  schema: { type: 'object', properties: { name: { type: 'string' } }, title: 'Test Form' },
  uiSchema: { name: { 'ui:widget': 'text' } },
};

// Helper component for providing context to EditTemplateActions
const EditTemplateActionsWithContext: React.FC<{ doSave?: () => void; handleCancel?: () => void; saving?: boolean }> = ({
  doSave = jest.fn(),
  handleCancel = jest.fn(),
  saving = false,
}) => {
  mockSaving = saving; 
  return (
    <TemplateFormActionsContext.Provider value={{ doSave, handleCancel }}>
      <EditTemplateActions />
    </TemplateFormActionsContext.Provider>
  );
};


describe('EditTemplate.tsx Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRAUseRecordContext.mockReturnValue(initialMockRecord); 
    mockSaving = false; 
  });

  describe('EditTemplateActions Component', () => {
    it('renders Save and Cancel buttons', () => {
      render(<EditTemplateActionsWithContext />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls doSave from context when Save button is clicked', () => {
      const doSaveMock = jest.fn();
      render(<EditTemplateActionsWithContext doSave={doSaveMock} />);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(doSaveMock).toHaveBeenCalledTimes(1);
    });

    it('calls handleCancel from context when Cancel button is clicked', () => {
      const handleCancelMock = jest.fn();
      render(<EditTemplateActionsWithContext handleCancel={handleCancelMock} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(handleCancelMock).toHaveBeenCalledTimes(1);
    });

    it('disables Save button when saving is true', () => {
      render(<EditTemplateActionsWithContext saving={true} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });
     it('disables Cancel button when saving is true', () => {
      render(<EditTemplateActionsWithContext saving={true} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  describe('TemplateEditorForm Component (New Layout)', () => {
    const mockSetSchema = jest.fn();
    const mockSetUiSchema = jest.fn();
    const defaultSchema = { type: 'object', properties: { test: { type: 'string' } }, title: 'Default Schema' };
    const defaultUiSchema = { test: { 'ui:label': 'Test Field' } };

    const renderTemplateEditorForm = (props = {}) => {
      const schema = props.schema || defaultSchema;
      const uiSchema = props.uiSchema || defaultUiSchema;
      const utils = render(
        <TemplateEditorForm
          schema={schema}
          uiSchema={uiSchema}
          setSchema={mockSetSchema}
          setUiSchema={mockSetUiSchema}
          {...props}
        />
      );
      // Re-query for panels after each render
      const leftPanel = screen.getByTestId('left-panel');
      const rightPanel = screen.getByTestId('right-panel');
      return { ...utils, mockSetSchema, mockSetUiSchema, leftPanel, rightPanel, currentSchema: schema, currentUiSchema: uiSchema };
    };

    it('renders DraggableContainer with left and right panels', () => {
      const { leftPanel, rightPanel } = renderTemplateEditorForm();
      expect(screen.getByTestId('mock-draggable-container')).toBeInTheDocument();
      expect(leftPanel).toBeInTheDocument();
      expect(rightPanel).toBeInTheDocument();
    });
    
    it('renders Tabs (Builder and Manual) in the left panel', () => {
      const { leftPanel } = renderTemplateEditorForm();
      expect(within(leftPanel).getByRole('tab', { name: /builder/i })).toBeInTheDocument();
      expect(within(leftPanel).getByRole('tab', { name: /manual/i })).toBeInTheDocument();
    });

    it('renders FormPreview in the right panel and it receives initial schema/uiSchema', () => {
      const { rightPanel, currentSchema, currentUiSchema } = renderTemplateEditorForm();
      // Assuming FormPreview renders a card with title "Live Preview"
      const livePreviewCard = within(rightPanel).getByText(/Live Preview/i).closest('.ant-card');
      expect(livePreviewCard).toBeInTheDocument();

      // To test props on FormPreview more directly, we rely on its internal rendering
      // that uses schema.title or 'unnamed'.
      // If schema has a title, it should be in FormPreview's output.
      if (currentSchema.title) {
         expect(within(rightPanel).getByText(new RegExp(`Form Preview - ${currentSchema.title}`, "i"))).toBeInTheDocument();
      } else {
         expect(within(rightPanel).getByText(/Form Preview - unnamed/i)).toBeInTheDocument();
      }
    });


    describe('Builder Tab (in Left Panel)', () => {
      it('renders FormBuilder with correct schema and uischema props', () => {
        const { leftPanel } = renderTemplateEditorForm();
        act(() => {
          fireEvent.click(within(leftPanel).getByRole('tab', { name: /builder/i }));
        });
        
        const formBuilder = within(leftPanel).getByTestId('mock-form-builder');
        expect(formBuilder).toBeInTheDocument();
        
        const mockFormBuilderComp = jest.requireMock('@ginkgo-bioworks/react-json-schema-form-builder').FormBuilder;
        const lastCallProps = mockFormBuilderComp.mock.calls[mockFormBuilderComp.mock.calls.length - 1][0];
        expect(lastCallProps.schema).toEqual(JSON.stringify(defaultSchema));
        expect(lastCallProps.uischema).toEqual(JSON.stringify(defaultUiSchema));
      });
    });

    describe('Manual Tab (in Left Panel)', () => {
      let leftPanel: HTMLElement; // To store leftPanel for access in tests

      beforeEach(() => {
        const utils = renderTemplateEditorForm();
        leftPanel = utils.leftPanel; // Assign leftPanel from render output
        act(() => {
          fireEvent.click(within(leftPanel).getByRole('tab', { name: /manual/i }));
        });
      });

      it('renders JSON Schema and UI Schema textareas with stringified values', () => {
        // Textareas are now within the 'Manual Edit' card in the left panel
        const manualEditCard = within(leftPanel).getByText(/Manual Edit/i).closest('.ant-card-body');
        expect(manualEditCard).toBeInTheDocument();

        const textareas = within(manualEditCard!).getAllByRole('textbox');
        expect(within(manualEditCard!).getByText('JSON Schema')).toBeInTheDocument();
        expect(within(manualEditCard!).getByText('UI Schema')).toBeInTheDocument();
        
        // Fragile: relies on order. Consider adding test-ids to textareas in actual component.
        const schemaTextarea = textareas[0]; 
        const uiSchemaTextarea = textareas[1];

        expect(schemaTextarea).toHaveValue(JSON.stringify(defaultSchema, null, 2));
        expect(uiSchemaTextarea).toHaveValue(JSON.stringify(defaultUiSchema, null, 2));
      });

      it('calls setSchema with parsed JSON on valid schema input', () => {
        const manualEditCard = within(leftPanel).getByText(/Manual Edit/i).closest('.ant-card-body');
        const schemaTextarea = within(manualEditCard!).getAllByRole('textbox')[0];
        const newSchema = { type: 'object', title: 'Updated Schema' };
        fireEvent.change(schemaTextarea, { target: { value: JSON.stringify(newSchema) } });
        
        expect(mockSetSchema).toHaveBeenCalledWith(newSchema);
        expect(within(manualEditCard!).queryByText(/Invalid JSON format/i)).not.toBeInTheDocument();
      });

      it('shows error and does not call setSchema on invalid schema input', () => {
        const manualEditCard = within(leftPanel).getByText(/Manual Edit/i).closest('.ant-card-body');
        const schemaTextarea = within(manualEditCard!).getAllByRole('textbox')[0];
        fireEvent.change(schemaTextarea, { target: { value: 'invalid json' } });
        
        expect(mockSetSchema).not.toHaveBeenCalled();
        expect(within(manualEditCard!).getByText(/Invalid JSON format/i)).toBeInTheDocument();
      });
    });
    
    it('FormPreview in rightPanel reflects schema changes from Builder tab', () => {
        const { leftPanel, rightPanel } = renderTemplateEditorForm();
        const newSchemaData = { type: "object", title: "Updated From Builder" };

        act(() => {
          fireEvent.click(within(leftPanel).getByRole('tab', { name: /builder/i }));
        });
        
        // Simulate change from FormBuilder (mocked)
        act(() => {
            mockFormBuilderOnChange(JSON.stringify(newSchemaData), JSON.stringify(defaultUiSchema));
        });

        // Verify mockSetSchema was called (which updates EditForm's state)
        expect(mockSetSchema).toHaveBeenCalledWith(newSchemaData);

        // Re-render TemplateEditorForm with the new schema that would come from EditForm
        renderTemplateEditorForm({ schema: newSchemaData, uiSchema: defaultUiSchema });
        
        // Check if FormPreview in the right panel reflects this new title
        const updatedRightPanel = screen.getByTestId('right-panel'); // Re-query right panel after re-render
        expect(within(updatedRightPanel).getByText(new RegExp(`Form Preview - ${newSchemaData.title}`, "i"))).toBeInTheDocument();
    });

    it('FormPreview in rightPanel reflects schema changes from Manual tab', () => {
        const { leftPanel, rightPanel } = renderTemplateEditorForm();
        const newSchemaData = { type: "object", title: "Updated From Manual" };

        act(() => {
          fireEvent.click(within(leftPanel).getByRole('tab', { name: /manual/i }));
        });
        
        const manualEditCard = within(leftPanel).getByText(/Manual Edit/i).closest('.ant-card-body');
        const schemaTextarea = within(manualEditCard!).getAllByRole('textbox')[0];

        act(() => {
            fireEvent.change(schemaTextarea, { target: { value: JSON.stringify(newSchemaData) } });
        });
        
        expect(mockSetSchema).toHaveBeenCalledWith(newSchemaData);

        // Re-render TemplateEditorForm with the new schema
        renderTemplateEditorForn({ schema: newSchemaData, uiSchema: defaultUiSchema });
        
        const updatedRightPanel = screen.getByTestId('right-panel');
        expect(within(updatedRightPanel).getByText(new RegExp(`Form Preview - ${newSchemaData.title}`, "i"))).toBeInTheDocument();
    });

  });

  // EditForm and EditTemplateActions tests are less likely to be affected by
  // TemplateEditorForm's internal layout changes, as they interact via props/context.
  // A quick check of their most relevant tests:
  describe('EditForm Component (Post-Layout Change Context)', () => {
    const renderEditFormAndGetContextConsumer = (record = initialMockRecord) => {
      mockRAUseRecordContext.mockReturnValue(record);
      let contextValue: any = {};
      const TestConsumer = () => {
        contextValue = React.useContext(TemplateFormActionsContext);
        return null; // No actual rendering needed for consumer
      };
      render(
        <EditForm>
          <TestConsumer />
        </EditForm>
      );
      return { doSave: contextValue.doSave, handleCancel: contextValue.handleCancel };
    };
    
    it('still provides doSave and handleCancel via context', () => {
      const { doSave, handleCancel } = renderEditFormAndGetContextConsumer();
      expect(doSave).toBeInstanceOf(Function);
      expect(handleCancel).toBeInstanceOf(Function);
    });

    it('TemplateEditorForm is rendered (implicitly testing EditForm passes props)', () => {
        mockRAUseRecordContext.mockReturnValue(initialMockRecord);
        render(<EditForm />);
        expect(screen.getByTestId('mock-draggable-container')).toBeInTheDocument(); // Root of TemplateEditorForm
    });
  });
  
  describe('EditTemplate (Integration - Post-Layout Change)', () => {
    it('renders Edit view with title, actions, and DraggableContainer from TemplateEditorForm', () => {
      render(<EditTemplate />);
      expect(screen.getByRole('heading', { name: /edit template/i })).toBeInTheDocument();
      expect(screen.getByTestId('edit-actions-container')).toBeInTheDocument();
      expect(screen.getByTestId('mock-draggable-container')).toBeInTheDocument(); // Check if TemplateEditorForm's root is there
    });
  });
});
