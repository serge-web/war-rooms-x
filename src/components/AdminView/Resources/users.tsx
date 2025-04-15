import { Typography } from "antd";
import { Create, Datagrid, Edit, List, Show, SimpleForm, SimpleShowLayout, TextField, TextInput } from "react-admin";

export const ListUser = () => (
  <List>
      <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
      </Datagrid>
  </List>
);

export const ShowUser = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
        </SimpleShowLayout>
    </Show>
);

export const CreateUser = () => (
  <Create>
      <SimpleForm>
          <TextInput source="id" />
          <TextInput source="name" />
          <Typography.Paragraph><strong>Note:</strong>Password for new user will be set to `pwd`</Typography.Paragraph>
      </SimpleForm>
  </Create>
);

export const EditUser = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
)
  