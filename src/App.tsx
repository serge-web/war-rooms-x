import './App.css'
import Login from './components/Login/Login'
import PlayerView from './components/PlayerView/PlayerView'
import { useWargame } from './contexts/WargameContext'
import { WargameProvider } from './contexts/WargameProvider'

function AppContent() {
  const { loggedIn } = useWargame()

  return (
    <div className="app-container">
      {!loggedIn ? (
        <Login />
      ) : (
        <PlayerView />
      )}
    </div>
  )
}

function App() {
  return (
    <WargameProvider>
      <AppContent />
    </WargameProvider>
  )
}

export default App
