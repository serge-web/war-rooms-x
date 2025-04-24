import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex, Modal, Switch, Tag } from 'antd'
import './Login.css'
import fakeDataProvider from 'ra-data-fakerest'
import { useWargame } from '../../contexts/WargameContext'
import { XMPPService } from '../../services/XMPPService'
import { XMPPRestService } from '../../services/XMPPRestService'
import { mockBackend } from '../../mockData/mockAdmin'
import dataProvider from '../AdminView/dataProvider'

const defaultIp = '10.211.55.16'
const defaultHost = 'ubuntu-linux-2404'
const remoteIp = '134.209.31.87'
const remoteHost = 'war-rooms-x'


const Login: React.FC = () => {
  const [ip, setIp] = useState(defaultIp)
  const [host, setHost] = useState(defaultHost)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setXmppClient, setRaDataProvider } = useWargame()
  const [userLocal, setUseLocal] = useState(false)

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

  useEffect(() => {
    if (userLocal) {
      setIp(defaultIp)
      setHost(defaultHost)
    } else {
      setIp(remoteIp)
      setHost(remoteHost)
    }
  }, [userLocal])

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
    const restAuth = await RestService.authenticateWithSecretKey('INSERT_KEY_HERE')
    const xmppService = new XMPPService()
    const xmppAuth = await xmppService.connect(ip, host, username, password)
    // wait a second, to allow xmpp to initialize
    await new Promise(resolve => setTimeout(resolve, 50))
    if (restAuth && xmppAuth) {
      setRaDataProvider(dataProvider(RestService, xmppService))
    } else {
      setError('REST Auth failed, please check username and password')
    }
  }  

  const handleMockRest = async () => {
    const data = mockBackend
    const mockDataProvider = fakeDataProvider(data)
    setRaDataProvider(mockDataProvider)
  }  

  return (
    <div className="login-container">
      <Modal open={!!error} title="Login Error" onOk={() => setError(null)} onCancel={() => setError(null)}>
        <p>{error}</p>
      </Modal>
      <Card title="War Rooms X - Login" className="login-card">
        <Form layout="vertical" onFinish={handleLogin} initialValues={{ ip, host, username, password }}>
          <Flex>
            <Switch
              title="Use Remote Server"
              checked={userLocal}
              onChange={setUseLocal}
              checkedChildren="Local"
              unCheckedChildren="Remote"
            />
            <Tag>{ip}</Tag>
            <Tag>{host}</Tag>
          </Flex>

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
          <div>
          <Flex justify='center' vertical={false}>
            { loginRoles.map(([ip, host, name, pwd]) => (
              <Button key={name} onClick={() => doLogin(ip, host, name, pwd)}>
                {name}
              </Button>
            ))}
            </Flex>
            <Flex justify='center' vertical={false}>
              <Button className="admin-rest-button" key={'restLogin'} onClick={() => handleRestLogin(loginRoles[0][2], loginRoles[0][3])}>
                Admin
              </Button>
              <Button className="mock-rest-button" key={'mockLogin'} onClick={() => handleMockRest()}>
                Mock Admin
              </Button>
          </Flex>
          </div>
          <Flex vertical={false}>
            <Button className="mock-button" onClick={handleMock} block>
              Mock
            </Button>
            <Button className="login-button" type="primary" name="login" htmlType="submit" disabled={!loginEnabled} block>
              Login
            </Button>
            <Button className="admin-button" type="primary" onClick={() => handleRestLogin(username, password)} disabled={!loginEnabled} block>
              Admin
            </Button>
        </Flex>
        </Form>
      </Card>
    </div>
  )
}

export default Login
