import { useState } from 'react'
import './App.css'
import Login from './components/Login/Login'
import PlayerView from './components/PlayerView/PlayerView'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <PlayerView onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
