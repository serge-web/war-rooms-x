import React from 'react'
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import CustomLayout from './CustomLayout'
import { ListGroup } from './Resources/groups'
import { ListUser } from './Resources/users'
import { ListRoom } from './Resources/rooms'
import './styles.css'

export const AdminView: React.FC = () => {
  const {raDataProvider} = useWargame()
  if (!raDataProvider) return null
  return (
  <Admin dataProvider={raDataProvider} layout={CustomLayout}>
    <Resource name="groups" list={ListGroup} icon={GroupIcon} options={{label: 'Forces'}}  />
    <Resource name="users" list={ListUser} icon={PersonIcon} options={{label: 'Roles'}} />
    <Resource name="chatrooms" list={ListRoom} icon={ChatIcon} options={{label: 'Rooms'}} />
  </Admin>
  )
}