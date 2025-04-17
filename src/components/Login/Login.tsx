import React, { useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex, Modal } from 'antd'
import './Login.css'
import { useWargame } from '../../contexts/WargameContext'
import { XMPPService } from '../../services/XMPPService'
import { XMPPRestService } from '../../services/XMPPRestService'
import dataProvider from '../AdminView/dataProvider'

const defaultIp = '10.211.55.16'
const defaultHost = 'ubuntu-linux-2404'

const Login: React.FC = () => {
  const [ip, setIp] = useState(defaultIp)
  const [host, setHost] = useState(defaultHost)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setXmppClient, setRaDataProvider } = useWargame()

  const loginRoles = [
    [ip, host, 'admin', 'pwd'],
    [ip, host, 'blue-co', 'pwd'],
    [ip, host, 'red-co', 'pwd'],
    [ip, host, 'no-perms', 'pwd'],
  ]

  const loginEnabled = useMemo(() => {
    return username && password && host
  }, [host, username, password])

  const handleMock = () => {
    setXmppClient(null)
  }

  const handleLogin = () => {
    doLogin(ip,host, username, password)
  }

  const doLogin = async (ip: string, host: string, name: string, pwd: string) => {
    const xmpp = new XMPPService()
    try {
      const success = await xmpp.connect(ip, host, name, pwd)
      if (success) {
        setXmppClient(xmpp)
      } else {
        setError('Auth failed, please check username and password')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  const handleRestLogin = async (username: string, password: string) => {
    // note: we'll prob need the standard config, since our data provider will prob 
    // need to fall back on xmpp calls for pubsub bits
    console.log('about to init REST', username, password)
    // try to auth over rest
    const RestService = new XMPPRestService()
    RestService.initialiseProxy('/openfire-rest')
    const res = await RestService.authenticateWithSecretKey('INSERT_KEY_HERE')
    console.log('rest result', res)
    if (res) {
      setRaDataProvider(dataProvider(RestService))
    } else {
      setError('REST Auth failed, please check username and password')
    }
  }  

  return (
    <div className="login-container">
      <Modal open={!!error} title="Login Error" onOk={() => setError(null)} onCancel={() => setError(null)}>
        <p>{error}</p>
      </Modal>
      <Card title="War Rooms X - Login" className="login-card">
        <Form layout="vertical" onFinish={handleLogin} initialValues={{ ip, host, username, password }}>
        <Form.Item label="IP" name="ip">
            <Input 
              placeholder="Enter your IP" 
              value={ip} 
              onChange={(e) => setIp(e.target.value)} 
            />
          </Form.Item>
        <Form.Item label="Host" name="host">
            <Input 
              placeholder="Enter your host" 
              value={host} 
              onChange={(e) => setHost(e.target.value)} 
            />
          </Form.Item>

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
            { loginRoles.map(([ip, host, name, pwd]) => (
              <Button key={name} onClick={() => doLogin(ip, host, name, pwd)}>
                {name}
              </Button>
            ))}
              <Button key={'restLogin'} onClick={() => handleRestLogin(loginRoles[0][2], loginRoles[0][3])}>
                REST
              </Button>
          </Flex>

          <Flex vertical={false}>
            <Button onClick={handleMock} block>
              Mock
            </Button>
            <Button type="primary" name="login" htmlType="submit" disabled={!loginEnabled} block>
              Login
            </Button>
            <Button type="primary" onClick={() => handleRestLogin(username, password)} disabled={!loginEnabled} block>
              Admin
            </Button>
        </Flex>
        </Form>
      </Card>
    </div>
  )
}

export default Login
