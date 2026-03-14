/**
 * src/scene/index.js
 *
 * M2 — AR.js integration.
 *
 * Pipeline:
 *   ArToolkitSource  → device camera as the AR background video feed
 *   ArToolkitContext → marker detection engine (camera_para.dat calibration)
 *   Three.js scene   → 3D objects anchored to detected markers via markerRoots
 *
 * Markers registered here:
 *   Hiro (preset)     → green cube   — print standard Hiro marker to test
 *   HVAC vent (.patt) → orange cube  — print /src/markers/hvac-vent-printable.svg
 *
 * M3: replace the placeholder cubes with geothermal components from /src/components.
 *
 * Why dynamic import for AR.js:
 *   AR.js ships as a UMD bundle that reads window.THREE at parse time.
 *   Static ES imports can be evaluated in parallel by the runtime/bundler,
 *   so there is no reliable ordering guarantee between sibling imports.
 *   A top-level `await import()` is sequential by definition — it runs after
 *   all static imports are resolved, so window.THREE is always set first.
 */

// ─── Static imports (evaluated before module body) ────────────────────────────
import * as THREE from 'three'
import { initArSource, initArContext, createResizeHandler } from '../utils/arToolkit.js'
// arToolkit.js sets window.THREE = THREE as a side effect ↑

// ─── Load AR.js after window.THREE is guaranteed to exist ────────────────────
// Dynamic import is sequential: the line below will not resolve until
// window.THREE is already in place from the static imports above.
await import('@ar-js-org/ar.js/three.js/build/ar.js')
// window.THREEx is now available on the global scope.

// ─── Renderer ────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace

// AR.js composites the video feed behind the WebGL canvas at the CSS level.
// Setting autoClear = false prevents Three.js from wiping what AR.js drew
// into the DOM each frame — the canvas must stay transparent so the video shows.
renderer.autoClear = false

document.body.appendChild(renderer.domElement)

// ─── Scene ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene()

// ─── Camera ──────────────────────────────────────────────────────────────────
// projectionMatrix is overwritten by initArContext once camera_para.dat loads,
// replacing the default perspective projection with the physical lens calibration.

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
scene.add(camera)

// ─── Lighting ────────────────────────────────────────────────────────────────

const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)

const sun = new THREE.DirectionalLight(0xffffff, 1.2)
sun.position.set(4, 6, 4)
scene.add(sun)

// ─── AR toolkit init ─────────────────────────────────────────────────────────

const arSource = initArSource(renderer)
const arContext = initArContext(camera)

// ─── Marker 1: Hiro (built-in preset) ────────────────────────────────────────
// Green cube. Print the standard Hiro marker to test.
// https://ar-js-org.github.io/AR.js/data/images/hiro.png

const hiroRoot = new THREE.Group()
scene.add(hiroRoot)

new window.THREEx.ArMarkerControls(arContext, hiroRoot, {
  type: 'preset',
  preset: 'hiro',
  // modelViewMatrix: AR.js moves the marker root to match the detected marker.
  // The camera stays fixed. Use this mode for multi-marker scenes so each root
  // gets its own independent transform.
  changeMatrixMode: 'modelViewMatrix',
})

hiroRoot.add(
  new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0x2ecc71, specular: 0x55aa55, shininess: 60 }),
  ),
)

console.info('[AR] Hiro marker root registered')

// ─── Marker 2: HVAC vent (custom .patt) ──────────────────────────────────────
// Orange cube. Print /src/markers/hvac-vent-printable.svg to test.
// Pattern trained as a cross/plus motif — see hvac-vent.patt for details.

const hvacRoot = new THREE.Group()
scene.add(hvacRoot)

new window.THREEx.ArMarkerControls(arContext, hvacRoot, {
  type: 'pattern',
  patternUrl: '/markers/hvac-vent.patt',
  changeMatrixMode: 'modelViewMatrix',
})

hvacRoot.add(
  new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xe67e22, specular: 0xaa5500, shininess: 60 }),
  ),
)

console.info('[AR] HVAC vent marker root registered')

// ─── Marker detection logging ─────────────────────────────────────────────────
// Emits a console line each time a marker enters or leaves detection.
// Useful for mobile debug sessions where the DevTools console is open via
// remote debugging (chrome://inspect or Safari Web Inspector).

function watchMarker(root, name) {
  let prev = false
  return () => {
    if (root.visible === prev) return
    prev = root.visible
    console.info(`[AR] ${name}: ${prev ? 'DETECTED ✓' : 'LOST'}`)
  }
}

const watchHiro = watchMarker(hiroRoot, 'Hiro')
const watchHvac = watchMarker(hvacRoot, 'HVAC vent')

// ─── Resize handler ──────────────────────────────────────────────────────────

window.addEventListener('resize', createResizeHandler(arSource, arContext, renderer))

// ─── Animation loop ──────────────────────────────────────────────────────────
// Single loop drives both AR tracking and Three.js rendering.
// arSource.ready gates the update calls — the video stream may not be open yet
// on the first few frames, especially on mobile.

function animate() {
  requestAnimationFrame(animate)

  if (!arSource.ready) return

  // Feed the current video frame into the marker detection engine.
  arContext.update(arSource.domElement)

  watchHiro()
  watchHvac()

  renderer.render(scene, camera)
}

animate()

// ─── Exports ─────────────────────────────────────────────────────────────────
// scene, camera, renderer are consumed by components in M3.

export { scene, camera, renderer }
