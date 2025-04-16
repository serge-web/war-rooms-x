import { AutocompleteArrayInput, Datagrid, Edit, List, ReferenceArrayField, ReferenceArrayInput, Show, SimpleForm, SimpleShowLayout, TextField, TextInput } from "react-admin";

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
  <Edit optimisticLocking={false}>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="name" />
          <TextInput source="description" />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
          <ReferenceArrayInput source="memberForces" reference="groups">
            <AutocompleteArrayInput optionText="id" />          
          </ReferenceArrayInput>      
      </SimpleForm>
  </Edit>
);