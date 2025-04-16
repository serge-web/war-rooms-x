import React from 'react'
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { CreateGroup, EditGroup, ListGroup } from './Resources/groups'
import { ListUser, CreateUser, EditUser } from './Resources/users'
import { RoomEdit, RoomList } from './Resources/rooms'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  if (!restClient) return null
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGroup} edit={EditGroup} create={CreateGroup} />
    <Resource name="users" list={ListUser} edit={EditUser} create={CreateUser} />
    <Resource name="chatrooms" list={RoomList} edit={RoomEdit} />
  </Admin>
  )
}