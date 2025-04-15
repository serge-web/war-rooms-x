import { Create, Datagrid, Edit, List, Show, SimpleForm, TextField, TextInput, ReferenceArrayInput, AutocompleteArrayInput } from 'react-admin'

export const EditGroup = () => (
  <Edit undoable={false}>
      <SimpleForm>
          <TextInput source="id" disabled />
          <TextInput source="description" />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
      </SimpleForm>
  </Edit>
);

export const ShowGroup = () => (
  <Show>
      <SimpleForm>
          <TextInput source="id" disabled />
          <TextInput source="description" />
          <ReferenceArrayInput disabled source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
      </SimpleForm>
  </Show>
);


export const CreateGroup = () => (
  <Create>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="description" />
          <ReferenceArrayInput source="members" reference="users">
            <AutocompleteArrayInput optionText="name" />          
          </ReferenceArrayInput>
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