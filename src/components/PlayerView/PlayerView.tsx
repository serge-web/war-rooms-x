import React from 'react'
import { Layout } from 'antd'
import './PlayerView.css'

const { Sider, Content } = Layout

const PlayerView: React.FC = () => {
  return (
    <Layout className="player-view" data-testid="player-view">
      <Layout>
        {/* Left panel - RoomsPanel */}
        <Content>
          <div className="rooms-panel" data-testid="rooms-panel">
            <div className="placeholder-content">RoomsPanel</div>
          </div>
        </Content>
        
        {/* Right panel - ControlPanel */}
        <Sider width={200} className="control-panel" data-testid="control-panel">
          {/* GameState component */}
          <div className="game-state" data-testid="game-state">
            <div className="placeholder-content">GameState</div>
          </div>

          {/* AdminMessages component */}
          <div className="admin-messages" data-testid="admin-messages">
            <div className="placeholder-content">AdminMessages</div>
          </div>

          {/* UserDetails component */}
          <div className="user-details" data-testid="user-details">
            <div className="placeholder-content">UserDetails</div>
          </div>
          
        </Sider>
      </Layout>
    </Layout>
  )
}

export default PlayerView
