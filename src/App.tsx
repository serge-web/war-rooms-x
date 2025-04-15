import './App.css'
import { AdminView } from './components/AdminView'
import Login from './components/Login/Login'
import PlayerView from './components/PlayerView/PlayerView'
import { useWargame } from './contexts/WargameContext'
import { WargameProvider } from './contexts/WargameProvider'

function AppContent() {
  const { loggedIn, restClient } = useWargame()

  return (
    <div className="app-container">
      {/* Add TestRestApi component for debugging */}
      {/* <TestRestApi /> */}
      {(!loggedIn && !restClient) && <Login /> }
      { loggedIn && <PlayerView /> }
      { restClient && <AdminView />} 
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
