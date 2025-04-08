import React from 'react'
import { Layout } from 'antd'
import { Header, Footer } from 'antd/es/layout/layout'

const { Sider, Content } = Layout

const PlayerView: React.FC = () => {


  const gameStateStyle: React.CSSProperties = {
    height: 120,
    backgroundColor: '#fff',
    border: '1px solid orange'
  };
  
  const roomsStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid green'
  };

  const adminMessagesStyle: React.CSSProperties = {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
    border: '1px solid yellow'
  };

  const controlPanelStyle: React.CSSProperties = {
    width: '300px',
    border: '1px solid green'
  };
  
  const userDetailsStyle: React.CSSProperties = {
    height: '100px',
    border: '1px solid blue'
  };
  
  const layoutStyle = {
    overflow: 'hidden',
    border: '1px solid brown'
  };
  

  return (
    <Layout style={layoutStyle}>
      <Content style={roomsStyle}>Rooms</Content>
      <Sider width="25%" style={controlPanelStyle}>
        <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Header style={gameStateStyle}>Game State</Header>
          <Content style={adminMessagesStyle}>Admin Messages</Content>
          <Footer style={userDetailsStyle}>User Details</Footer>
        </Layout>
      </Sider>
    </Layout>
  )
}

export default PlayerView
