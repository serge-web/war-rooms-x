import React from 'react'
import { ConfigProvider, Layout } from 'antd'
import { Header, Footer } from 'antd/es/layout/layout'
import GameState from '../GameState'
import AdminRoom from '../Rooms/AdminRoom'
import UserDetails from '../UserDetails'
import RoomsList from '../Rooms/RoomsList'
import { useGameProperties } from '../GameState/useGameSetup'

const { Sider, Content } = Layout

const PlayerView: React.FC = () => {
  const { name, description, playerTheme, adminTheme } = useGameProperties()
  const gameStateStyle: React.CSSProperties = {
    height: 120,
    backgroundColor: '#ccc',
    lineHeight: '20px',
    padding: '10px'
  }
  
  const roomsStyle: React.CSSProperties = {
    width: '100%',
    lineHeight: '20px'
  }

  const adminMessagesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
    lineHeight: '20px'
  }

  const controlPanelStyle: React.CSSProperties = {
    width: '300px',
    lineHeight: '20px'
  }
  
  const userDetailsStyle: React.CSSProperties = {
    lineHeight: '20px',
    padding: '15px',
    backgroundColor: '#ccc'
  }
  
  const layoutStyle = {
    overflow: 'hidden',
    lineHeight: '20px'  
  }

  return (
    <Layout style={layoutStyle}>
      <Content style={roomsStyle}>
        <ConfigProvider theme={playerTheme}>
          <RoomsList />
        </ConfigProvider>
      </Content>
      <Sider width="25%" style={controlPanelStyle}>
        <ConfigProvider theme={adminTheme}>
          <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Header style={gameStateStyle}>
              <GameState name={name} description={description} />
            </Header>
            <Content style={adminMessagesStyle}>
              <AdminRoom />
          </Content>
          <Footer style={userDetailsStyle}>
            <UserDetails />
          </Footer>
        </Layout>
        </ConfigProvider>
      </Sider>
    </Layout>
  )
}

export default PlayerView
