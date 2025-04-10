import React, { useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex, Modal } from 'antd'
import './Login.css'
import { useWargame } from '../../contexts/WargameContext'
import { XMPPService } from '../../services/XMPPService'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setXmppClient } = useWargame()

  const loginEnabled = useMemo(() => {
    return username && password
  }, [username, password])

  const handleMock = () => {
    setXmppClient(null)
  }

  const handleLogin = async () => {
    // collect username and password, and use in mock auth
    console.log('Logging in with:', username, password)
    // generate the XMPP client, try to log in
    const xmpp = new XMPPService()
    try {
      const connected = await xmpp.connect('10.211.55.16', username, password)
      if (connected) {
        setXmppClient(xmpp)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="login-container">
      <Modal open={!!error} title="Login Error" onCancel={() => setError('')}>
        <p>{error}</p>
      </Modal>
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
