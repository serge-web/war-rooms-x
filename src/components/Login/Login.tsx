import React, { useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex, Modal } from 'antd'
import './Login.css'
import { useWargame } from '../../contexts/WargameContext'
import { XMPPService } from '../../services/XMPPService'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setXmppClient } = useWargame()

  const loginRoles = [
    ['admin', 'pwd'],
    ['blue-co', 'pwd'],
    ['red-co', 'pwd'],
    ['no-perms', 'pwd'],
  ]

  const loginEnabled = useMemo(() => {
    return username && password
  }, [username, password])

  const handleMock = () => {
    setXmppClient(null)
  }


  const doLogin = async (name: string, pwd: string) => {
    const xmpp = new XMPPService()
    try {
      const success = await xmpp.connect('10.211.55.16', name, pwd)
      if (success) {
        setXmppClient(xmpp)
      } else {
        setError('Auth failed, please check username and password')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleLogin = () => {
    doLogin(username, password)
  }

  return (
    <div className="login-container">
      <Modal open={!!error} title="Login Error" onCancel={() => setError(null)}>
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
          <Flex justify='center' vertical={false}>

          { loginRoles.map(([name, pwd]) => (
            <Button key={name} onClick={() => doLogin(name, pwd)}>
              {name}
            </Button>
          ))}
          </Flex>

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
