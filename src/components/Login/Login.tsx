import React, { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Card, Flex, Modal, Switch, Tag, Tooltip } from 'antd'
import './Login.css'
import initializeLocalForageDataProvider, { resetLocalForageDataStore } from '../AdminView/localStorageDataProvider'
import { useWargame } from '../../contexts/WargameContext'
import { XMPPService } from '../../services/XMPPService'
import { XMPPRestService } from '../../services/XMPPRestService'
// We now use the mockBackend data from the localStorageDataProvider
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
  const { setXmppClient, setRaDataProvider, setMockPlayerId } = useWargame()
  const [userLocal, setUseLocal] = useState(false)

  const loginRoles = [
    [ip, host, 'admin', 'pwd'],
    [ip, host, 'blue-co', 'pwd'],
    [ip, host, 'red-co', 'pwd'],
    [ip, host, 'no-perms', 'pwd'],
  ]

  const mockRoles = [
    ['admin', 'umpire'],
    ['blue-co', 'blue'],
    ['red-co', 'red'],
    ['blue-logs', 'blue'],
  ]

  const loginEnabled = useMemo(() => {
    return username && password && host
  }, [host, username, password])

  const loginMessage = useMemo(() => {
    return loginEnabled ? 'Click to login' : 'Please enter username and password'
  }, [loginEnabled])

  const handleMock = (playerId: string, forceId: string) => {
    setMockPlayerId({ playerId, forceId })
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
    try {
      const xmppAuth = await xmppService.connect(ip, host, username, password)
      // wait a second, to allow xmpp to initialize
      await new Promise(resolve => setTimeout(resolve, 50))
      if (restAuth && xmppAuth) {
        setRaDataProvider(dataProvider(RestService, xmppService))
      } else {
        setError('REST Auth failed, please check username and password')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }  

  const handleMockRest = async () => {
    // Use the persistent local storage data provider
    const localStorageProvider = await initializeLocalForageDataProvider()
    setRaDataProvider(localStorageProvider)
  }
  
  const handleResetDataStore = async () => {
    try {
      await resetLocalForageDataStore()
      Modal.success({
        title: 'Data Reset Complete',
        content: 'The ra-data-local-forage data store has been reset with fresh default data.',
      })
    } catch (error) {
      Modal.error({
        title: 'Data Reset Failed',
        content: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <div className="login-container">
      <Modal open={!!error} title="Login Error" onOk={() => setError(null)} onCancel={() => setError(null)}>
        <p>{error}</p>
      </Modal>
      <div className="login-layout">
        <div className="logo-container">
          <img src="/war-rooms-logo.png" alt="War Rooms Logo" className="war-rooms-logo" />
        </div>
        <Card title="War Rooms X - Login" className="login-card">
        <Form layout="vertical" onFinish={handleLogin} initialValues={{ ip, host, username, password }}>
          <div className="button-group">

          <Flex style={{paddingBottom: '12px'}}>
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
          <Flex gap={16}>
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
          </Flex>

          {/* Real Login Buttons */}
          <div className="button-group">
            <Flex align="center" className="button-group-row">
              <div className="button-group-label">Production:</div>
              <Flex vertical={false} className="real-login-buttons">
                <Tooltip title={loginMessage}>
                  <Button className="login-button" type="primary" name="login" htmlType="submit" disabled={!loginEnabled}>
                    Player
                  </Button>
                </Tooltip>
                <Tooltip title={loginMessage}>
                  <Button className="admin-button" type="primary" onClick={() => handleRestLogin(username, password)} disabled={!loginEnabled}>
                    Game Control (Admin)
                  </Button>
                </Tooltip>
              </Flex>
            </Flex>
          </div>
          <div className="button-groups">
            {/* Development Player Interface Buttons */}
            <div className="button-group">
              <div className="dev-title">
                Development quick-links (real server)
              </div>
              <Flex align="center" className="button-group-row">
                <div className="button-group-label">Player UI</div>
                <Flex justify='center' vertical={false} className="dev-player-buttons">
                  { loginRoles.map(([ip, host, name, pwd]) => (
                    <Button key={name} onClick={() => doLogin(ip, host, name, pwd)}>
                      {name}
                    </Button>
                  ))}
                </Flex>
              </Flex>
              <Flex align="center" className="button-group-row">
                <div className="button-group-label">Admin UI</div>
                <Flex justify='center' vertical={false} className="dev-admin-buttons">
                  <Button className="admin-rest-button" key={'restLogin'} onClick={() => handleRestLogin(loginRoles[0][2], loginRoles[0][3])}>
                    Admin
                  </Button>
                  <Button className="mock-rest-button" key={'mockLogin'} onClick={() => handleMockRest()}>
                    Mock Admin
                  </Button>
                </Flex>
              </Flex>
            </div>
          </div>
          </div>

          <div className="button-groups">
            {/* Development Player Interface Buttons */}
            <div className="button-group">
              <div className="dev-title">
                Development quick-links (mock backend)
              </div>
              <Flex align="center" className="button-group-row">
                <div className="button-group-label">Player UI</div>
                <Flex justify='center' vertical={false} className="dev-player-buttons">
                  { mockRoles.map((item) => (
                    <Button key={item[0]} onClick={() => handleMock(item[0], item[1])}>
                      {item[0]}
                    </Button>
                  ))}
                </Flex>
              </Flex>
              <Flex align="center" className="button-group-row">
                <div className="button-group-label">Admin UI</div>
                <Flex justify='space-between' vertical={false} className="dev-admin-buttons">
                  <Button className="mock-rest-button" key={'mockLogin'} onClick={() => handleMockRest()}>
                    Admin
                  </Button>
                  <Button className="reset-data-button" key={'resetData'} onClick={() => handleResetDataStore()} style={{ marginLeft: '16px' }}>
                    Reset Data
                  </Button>
                </Flex>
              </Flex>
            </div>
          </div>
        </Form>
        </Card>
      </div>
    </div>
  )
}

export default Login
