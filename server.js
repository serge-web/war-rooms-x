import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer } from 'http'

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors());

// This line is currently included for debugging purposes only.
app.use('/openfire-rest', (req, res, next) => {
    console.log('Proxying request:', req.url);
    next();
});

app.use(
  '/openfire-rest',
  createProxyMiddleware({
    target: 'http://134.209.31.87:9090',
    changeOrigin: true,
    pathRewrite: (path, req) => {
      console.log('Rewriting path:', path)
      return path.replace(/^\/openfire-rest/, '/plugins/restapi/v1')
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying request to:', proxyReq.path)
      // proxyReq.setHeader('Authorization', 'YOUR_SECRET_KEY_HERE') 
    },
    onError(err, req, res) {
      console.error('Proxy error:', err)
      res.status(500).send('Proxy error')
    }
  })
)

const wsProxy = createProxyMiddleware({
  target: 'ws://134.209.31.87:7070/',
  changeOrigin: true,
  ws: true,
  pathRewrite: { '^/wss': '/ws' },
  router: {
    // Convert wss:// requests on port 7443 to ws:// on port 7070
    'wss://134.209.31.87:7443': 'ws://134.209.31.87:7070'
  },
  pathRewrite: {
    pathRewrite: { '^/wss': '/ws' },

  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    console.log('Proxying WS:', req.url)
  },
  onError: (err, req, res) => {
    console.error('WS proxy error:', err)
  }
})

server.on('upgrade', (req, socket, head) => {
  console.log('test url', req.url)
  if (req.url.startsWith('/ws')) {
    // req.url = req.url.replace(/^\/ws/, '')
    console.log('Updated req.url:', req.url)
    // req.url = '/xmpp'
    wsProxy.upgrade(req, socket, head)
  } else {
    socket.destroy()
  }
})

app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// Start server
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

