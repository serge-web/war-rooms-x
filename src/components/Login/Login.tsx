import React, { useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex } from 'antd'
import './Login.css'
import { useWargame } from '../../contexts/WargameContext'
import { mockUserDetails, mockForceData, mockGameState } from '../../components/PlayerView/UserDetails/mockData'
import { mockRooms } from '../PlayerView/Rooms/RoomsList/mockRooms'
import { MockRoom, RoomType } from '../../types/rooms'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { setLoggedIn, setPlayerDetails, setPlayerForce, setGameState, setRooms, setXmppClient } = useWargame()

  const loginEnabled = useMemo(() => {
    return username && password
  }, [username, password])

  const handleMock = () => {
    // populate the mock data
    setLoggedIn(true)
    setXmppClient(null)
    setPlayerDetails(mockUserDetails)
    setPlayerForce(mockForceData)
    setGameState(mockGameState)
    setRooms(mockRooms.map((room:MockRoom): RoomType => {
      return {
        roomName: room.id,
        naturalName: room.name,
      }
    }))
  }

  const handleLogin = () => {
    // collect username and password, and use in mock auth
    console.log('Logging in with:', username, password)
    window.alert('Login not implemented')
    // generate the XMPP client, try to log in
  }

  return (
    <div className="login-container">
      <Card title="War Rooms X - Login" className="login-card">
        <Form layout="vertical">
          <Form.Item label="Username" name="username">
            <Input 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </Form.Item>
          <Flex vertical={false}>
            <Button onClick={handleMock} block>
              Mock
            </Button>
            <Button type="primary" disabled={!loginEnabled} onClick={handleLogin} block>
              Login
            </Button>
        </Flex>
        </Form>
      </Card>
    </div>
  )
}

export default Login
