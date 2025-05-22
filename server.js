import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
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
    pathRewrite: {
      '^/openfire-rest': '/plugins/restapi/v1'
    }
  })
);

app.use(
  '/ws',
  createProxyMiddleware({
    target: 'ws://134.209.31.87:7070',
    changeOrigin: true,
    ws: true,
    pathRewrite: { '^/ws': '' }
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
