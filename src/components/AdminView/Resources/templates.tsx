import { Datagrid, List, TextField } from 'react-admin';

export const ListTemplates: React.FC = () => (
    <List>
        <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
        </Datagrid>
    </List>
);

