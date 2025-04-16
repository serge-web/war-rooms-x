import { AutocompleteArrayInput, Datagrid, Edit, List, ReferenceArrayField, ReferenceArrayInput, Show, SimpleForm, SimpleShowLayout, TextField, TextInput, useGetList } from 'react-admin';
import { RUser } from '../raTypes-d';

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

const NotOwnerDropdown = ({ source, reference }: { source: string; reference: string }) => {
  const users: RUser[] = useGetList<RUser>('users')?.data || []
  const nonAdminUsers = users.filter(user => user.id !== 'admin')
  return (
    <ReferenceArrayInput  source={source} reference={reference} >
      <AutocompleteArrayInput helperText="Admin user already has access to all channels" source={source} optionText="name" optionValue="id" choices={nonAdminUsers}/>
    </ReferenceArrayInput>
  );
};

export const RoomEdit = () => {
  return (
    <Edit mutationMode='pessimistic'>
      <SimpleForm>
        <TextInput source="id" />
        <TextInput source="name" />
        <TextInput source="description" />
        <NotOwnerDropdown source="members" reference="users" />
        <ReferenceArrayInput source="memberForces" reference="groups">
          <AutocompleteArrayInput optionText="id" />          
        </ReferenceArrayInput>      
      </SimpleForm>
    </Edit>
  )
}