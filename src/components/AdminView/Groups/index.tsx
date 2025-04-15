import { Create, Datagrid, Edit, List, SimpleForm, TextField, TextInput } from "react-admin";

export const EditGroup = () => (
  <Edit undoable={false}>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <TextInput source="members" />
      </SimpleForm>
  </Edit>
);

export const CreateGroup = () => (
  <Create>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <TextInput source="members" />
      </SimpleForm>
  </Create>
);

export const GroupList = () => (
  <List>
      <Datagrid>
          <TextField source="id" />
          <TextField source="description" />
          <TextField source="members" />
      </Datagrid>
  </List>
);