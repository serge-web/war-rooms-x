import React from 'react'
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import CustomLayout from './CustomLayout'
import { ListGroup } from './Resources/groups'
import { ListUser } from './Resources/users'
import { ListRoom } from './Resources/rooms'
import './styles.css'
import { Dashboard } from './dashboard'
import { WargameList, WargameEdit } from './Resources/wargames';
import { ListTemplates, ShowTemplates } from './Resources/templates';
import EditTemplate from './Resources/EditTemplate';

export const AdminView: React.FC = () => {
  const {raDataProvider} = useWargame()
  if (!raDataProvider) return null
  return (
  <Admin dataProvider={raDataProvider} layout={CustomLayout} dashboard={Dashboard}>
    <Resource name="wargames" list={WargameList} edit={WargameEdit} icon={MilitaryTechIcon} options={{label: 'Wargames'}}  />
    <Resource name="groups" list={ListGroup} icon={GroupIcon} options={{label: 'Forces'}}  />
    <Resource name="users" list={ListUser} icon={PersonIcon} options={{label: 'Roles'}} />
    <Resource name="chatrooms" list={ListRoom} icon={ChatIcon} options={{label: 'Rooms'}} />
    <Resource name="templates" list={ListTemplates} show={ShowTemplates} edit={EditTemplate} icon={DynamicFormIcon} options={{label: 'Templates'}} />
  </Admin>
  )
}