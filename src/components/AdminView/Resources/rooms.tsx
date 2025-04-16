import { Datagrid, Edit, List, ReferenceArrayField, Show, SimpleForm, SimpleShowLayout, TextField, TextInput } from "react-admin";

export const RoomList = () => (
  <List>
      <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="description" />
          <TextField source="members" />
          <TextField source="memberForces" />
      </Datagrid>
  </List>
);

export const RoomShow = () => (
  <Show>
      <SimpleShowLayout>
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="description" />
          <ReferenceArrayField source="members" reference="users"/>
          <ReferenceArrayField source="memberForces" reference="groups"/>
      </SimpleShowLayout>
  </Show>
);

export const RoomEdit = () => (
  <Edit>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="name" />
          <TextInput source="description" />
          <TextInput source="members" />
          <TextInput source="memberForces" />
      </SimpleForm>
  </Edit>
);