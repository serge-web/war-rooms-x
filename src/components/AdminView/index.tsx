import React from 'react'
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { CreateGroup, EditGroup, ListGroup, ShowGroup } from './Resources/groups'
import { ListUser, ShowUser, CreateUser, EditUser } from './Resources/users'
import { RoomEdit, RoomList, RoomShow } from './Resources/rooms'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  if (!restClient) return null
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGroup} edit={EditGroup} create={CreateGroup} show={ShowGroup} />
    <Resource name="users" list={ListUser} edit={EditUser} show={ShowUser} create={CreateUser} />
    <Resource name="chatrooms" list={RoomList} show={RoomShow} edit={RoomEdit} />
  </Admin>
  )
}