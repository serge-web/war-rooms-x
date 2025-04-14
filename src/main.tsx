import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
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
//   console.log('Published:', data);
// })

// client.connect()


createRoot(document.getElementById('root')!).render(
  <App />
)

