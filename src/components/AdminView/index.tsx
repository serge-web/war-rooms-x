import React from 'react'
import { Admin, ListGuesser, Resource, ShowGuesser } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'
import { EditGroup } from './Groups'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGuesser} edit={EditGroup} />
    <Resource name="users" list={ListGuesser} show={ShowGuesser} />
    <Resource name="chatrooms" list={ListGuesser} show={ShowGuesser} />
  </Admin>
  )
}