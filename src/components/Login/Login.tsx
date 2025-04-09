import React from 'react'
import { Button, Form, Input, Card } from 'antd'
import './Login.css'
import { useWargame } from '../../contexts/WargameContext'

const Login: React.FC = () => {
  const { setLoggedIn } = useWargame()

  const handleLogin = () => {
    setLoggedIn(true)
  }

  return (
    <div className="login-container">
      <Card title="War Rooms X - Login" className="login-card">
        <Form layout="vertical">
          <Form.Item label="Username" name="username">
            <Input placeholder="Enter your username" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleLogin} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
