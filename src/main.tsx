import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'
// import * as XMPP from 'stanza'

// console.log('in main')
// const client = XMPP.createClient({
// jid: 'admin@ubuntu-linux-2404',
//   password: 'pwd',

//   // If you have a .well-known/host-meta.json file for your
//   // domain, the connection transport config can be skipped.
//   transports: {
//       websocket: 'ws://10.211.55.16:7070/ws/',
//       bosh: false
//   }
// });

// client.on('session:started', () => {
//   client.getRoster().then((roster) => {
//     console.log('Roster:', roster);
//   })
//   client.sendPresence();
//   client.subscribeToNode('pubsub.ubuntu-linux-2404', 'game-state');
// });
// // client.on('*', (event, data) => {
// //   console.log('Event:', event, data);
// // })
// client.on('pubsub:event', (data) => {
//   console.log('Pubsub event:', data);
// })
// client.on('pubsub:published', (data) => {
//   console.log('PubSub published:', data);
// })

// client.connect()

const client = axios.create({
  baseURL: '/openfire-rest',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging tests
  timeout: 5000
})
client.defaults.headers.common['Authorization'] = 'INSERT_KEY_HERE'
      
// Test authentication by making a simple request
const response = await client.get('/groups')

if (response.status === 200) {
  const content = response.data
  try {
    const groups = JSON.parse(content)
    console.log('Groups:', groups)
  } catch {
    console.error('Failed to parse groups response, prob not JSON')
  }
  console.log('REST client authenticated')
} else {
  console.error('REST client authentication failed')
}

createRoot(document.getElementById('root')!).render(
  <App />
)

