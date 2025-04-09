import React from 'react'
import { Layout } from 'antd'
import { Header, Footer } from 'antd/es/layout/layout'
import RoomsList from '../RoomsList'
import GameState from '../GameState'
import AdminMessages from '../AdminMessages'
import UserDetails from '../UserDetails'

const { Sider, Content } = Layout

const PlayerView: React.FC = () => {
  const gameStateStyle: React.CSSProperties = {
    height: 120,
    backgroundColor: '#ccc',
    lineHeight: '20px',
    padding: '10px'
  }
  
  const roomsStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid green',
    lineHeight: '20px'
  }

  const adminMessagesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
    border: '1px solid yellow',
    lineHeight: '20px'
  }

  const controlPanelStyle: React.CSSProperties = {
    width: '300px',
    border: '1px solid green',
    lineHeight: '20px'
  }
  
  const userDetailsStyle: React.CSSProperties = {
    border: '1px solid blue',
    lineHeight: '20px',
    padding: '15px',
    backgroundColor: '#ccc'
  }
  
  const layoutStyle = {
    overflow: 'hidden',
    border: '1px solid brown',
    lineHeight: '20px'  
  }

  return (
    <Layout style={layoutStyle}>
      <Content style={roomsStyle}>
        <RoomsList />
      </Content>
      <Sider width="25%" style={controlPanelStyle}>
        <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Header style={gameStateStyle}>
            <GameState />
          </Header>
          <Content style={adminMessagesStyle}>
            <AdminMessages />
          </Content>
          <Footer style={userDetailsStyle}>
            <UserDetails />
          </Footer>
        </Layout>
      </Sider>
    </Layout>
  )
}

export default PlayerView
