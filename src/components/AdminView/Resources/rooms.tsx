import { AutocompleteArrayInput, Datagrid, Edit, List, ReferenceArrayField, ReferenceArrayInput, Show, SimpleForm, SimpleShowLayout, TextField, TextInput, useEditContext, useGetList } from 'react-admin';
import { Typography } from '@mui/material';
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

const Aside = () => {
  const { record, isPending } = useEditContext();
  if (isPending) return null;
  return (
      <div>
          <Typography variant="h6">Posts stats</Typography>
          <Typography variant="body2">
              Last edition: {record.updated_at}
          </Typography>
      </div>
  );
};

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
        <Aside />
        <TextInput source="id" />
        <TextInput source="name" />
        <TextInput source="description" />
        <TextInput disabled source="owners" />
        <TextInput disabled source="admins" />
        <NotOwnerDropdown source="members" reference="users" />
        <ReferenceArrayInput source="memberForces" reference="groups">
          <AutocompleteArrayInput optionText="id" />          
        </ReferenceArrayInput>      
      </SimpleForm>
    </Edit>
  )
}