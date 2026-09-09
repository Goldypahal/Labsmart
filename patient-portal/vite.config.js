import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  publicDir: path.resolve(__dirname, '../stitch_srs_ui_component_generator'),
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'srs-static-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/stitch_srs_ui_component_generator/')) {
            const cleanUrl = req.url.split('?')[0];
            const filePath = path.join(__dirname, '..', cleanUrl);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
              else if (filePath.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
              else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
              else if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ],
})
