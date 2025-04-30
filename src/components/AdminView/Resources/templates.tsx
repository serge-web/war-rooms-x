import { Datagrid, List, Show, SimpleShowLayout, TextField } from 'react-admin';

export const ListTemplates: React.FC = () => (
    <List>
        <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
        </Datagrid>
    </List>
);


export const ShowTemplates = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="schema.type" />
            <TextField source="uiSchema.message.ui:widget" />
        </SimpleShowLayout>
    </Show>
)