import { Create, Datagrid, Edit, List, Show, SimpleForm, TextField, TextInput } from "react-admin";

export const EditGroup = () => (
  <Edit undoable={false}>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <TextInput source="members" />
      </SimpleForm>
  </Edit>
);

export const ShowGroup = () => (
  <Show>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <TextInput source="members" />
      </SimpleForm>
  </Show>
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

export const ListGroup = () => (
  <List>
      <Datagrid rowClick="show">
          <TextField source="id" />
          <TextField source="description" />
          <TextField source="members" />
      </Datagrid>
  </List>
);