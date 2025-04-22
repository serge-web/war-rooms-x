import { Datagrid, DateField, List, TextField } from 'react-admin';
import { DateInput, Edit, SimpleForm, TextInput } from 'react-admin';

export const WargameList = () => (
    <List>
        <Datagrid>
            <TextField source="turn" />
            <DateField source="currentTime" />
            <TextField source="currentPhase" />
            <DateField source="name" />
            <DateField source="description" />
            <DateField source="startTime" />
            <TextField source="stepTime" />
            <TextField source="turnType" />
        </Datagrid>
    </List>
);


export const WargameEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="turn" />
            <DateInput source="currentTime" />
            <TextInput source="currentPhase" />
            <DateInput source="name" />
            <DateInput source="description" />
            <DateInput source="startTime" />
            <TextInput source="stepTime" />
            <TextInput source="turnType" />
        </SimpleForm>
    </Edit>
);