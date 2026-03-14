import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import fs from 'fs'

// ─── Dev plugin: serve src/markers/ at /markers/ ─────────────────────────────
// AR.js fetches .patt files at runtime via HTTP. Vite only auto-serves files
// from public/, so this middleware plugin bridges src/markers/ into the dev
// server without requiring a separate build copy step.
//
// For production builds: copy src/markers/*.patt into public/markers/ before
// running `vite build`, or add a build script to package.json that does it.
const serveMarkersFromSrc = {
  name: 'serve-src-markers',
  configureServer(server) {
    server.middlewares.use('/markers', (req, res, next) => {
      // req.url is the path after the mount prefix, e.g. '/hvac-vent.patt'
      const filePath = path.join(process.cwd(), 'src/markers', req.url)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        fs.createReadStream(filePath).pipe(res)
      } else {
        next()
      }
    })
  },
}

export default defineConfig({
  plugins: [basicSsl(), serveMarkersFromSrc],

  server: {
    https: true,
    host: true, // exposes on LAN so mobile devices can connect for on-device AR testing
  },

  // AR.js ships as a self-contained UMD bundle that reads window.THREE at
  // parse time. Excluding it from Vite's pre-bundler prevents it from being
  // transformed in a way that breaks those global lookups.
  // Import path: @ar-js-org/ar.js/three.js/build/ar.js
  // Setup:       set window.THREE = THREE in arToolkit.js before this import.
  optimizeDeps: {
    exclude: ['@ar-js-org/ar.js'],
  },
})
