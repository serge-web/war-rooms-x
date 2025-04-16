import React from 'react'
import { Admin, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { ListGroup } from './Resources/groups'
import { ListUser } from './Resources/users'
import { ListRoom } from './Resources/rooms'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  if (!restClient) return null
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGroup}  />
    <Resource name="users" list={ListUser} />
    <Resource name="chatrooms" list={ListRoom} />
  </Admin>
  )
}