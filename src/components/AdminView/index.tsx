import React from 'react'
import { Admin, ListGuesser, Resource, ShowGuesser } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { CreateGroup, EditGroup, ListGroup, ShowGroup } from './Groups'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  if (!restClient) return null
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGroup} edit={EditGroup} create={CreateGroup} show={ShowGroup} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
    <Resource name="chatrooms" list={ListGuesser} show={ShowGuesser} />
  </Admin>
  )
}