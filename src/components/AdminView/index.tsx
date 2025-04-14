import React from 'react'
import { Admin, ListGuesser, Resource } from 'react-admin'
import { useWargame } from '../../contexts/WargameContext'
import dataProvider from './dataProvider'
import CustomLayout from './CustomLayout'

export const AdminView: React.FC = () => {
  const {restClient} = useWargame()
  return (
  <Admin dataProvider={dataProvider(restClient)} layout={CustomLayout}>
    <Resource name="groups" list={ListGuesser} />
  </Admin>
  )
}