import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  '/openfire-rest/',
  createProxyMiddleware({
    target: 'http://134.209.31.87:9090',
    changeOrigin: true,
    pathRewrite: { '^/openfire-rest/': '' }
  })
);

app.use(
  '/ws',
  createProxyMiddleware({
    target: 'ws://134.209.31.87:9090',
    changeOrigin: true,
    ws: true,
    pathRewrite: (path) => path.replace(/^\/ws/, ''),
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
