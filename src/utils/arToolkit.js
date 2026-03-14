/**
 * src/utils/arToolkit.js
 *
 * Reusable AR.js initialization helpers shared across all milestones.
 *
 * ⚠️  Import-order contract:
 *     This module sets window.THREE as a side effect.
 *     It MUST appear as the first import in any file that also imports
 *     @ar-js-org/ar.js, because AR.js's UMD bundle reads window.THREE at
 *     parse time. Violating this order results in a silent "THREE is not
 *     defined" failure inside the AR.js bundle.
 *
 * Usage in scene files:
 *     import { initArSource, initArContext, createResizeHandler } from '../utils/arToolkit.js'
 *     import '@ar-js-org/ar.js/three.js/build/ar.js'   // must come after ↑
 *
 * Note on THREEx:
 *     THREEx is a runtime global set by the AR.js UMD bundle. All references
 *     are via window.THREEx so the TypeScript language server doesn't flag them.
 */

import * as THREE from 'three'

// Expose THREE globally before AR.js loads.
window.THREE = THREE

// ─── Source ──────────────────────────────────────────────────────────────────

/**
 * Initialize an ArToolkitSource backed by the device webcam.
 * Resizes the renderer canvas to match the video feed once the stream opens.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {Function}            [onReady] - optional callback after camera opens
 * @returns {object} ArToolkitSource instance
 */
export function initArSource(renderer, onReady) {
  const arSource = new window.THREEx.ArToolkitSource({ sourceType: 'webcam' })

  arSource.init(() => {
    syncSize(arSource, renderer)
    onReady?.()
  })

  return arSource
}

// ─── Context ─────────────────────────────────────────────────────────────────

/**
 * Initialize an ArToolkitContext using the standard camera calibration file.
 * Copies the resulting projection matrix onto the Three.js camera so the
 * virtual frustum matches the physical lens.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @returns {object} ArToolkitContext instance
 */
export function initArContext(camera) {
  const arContext = new window.THREEx.ArToolkitContext({
    cameraParametersUrl: '/camera_para.dat',
    detectionMode: 'mono',
  })

  arContext.init(() => {
    camera.projectionMatrix.copy(arContext.getProjectionMatrix())
  })

  return arContext
}

// ─── Sizing ───────────────────────────────────────────────────────────────────

/**
 * Resize the AR source video element, then sync the renderer canvas to it.
 * Must be called on init and on every resize/orientation-change event.
 *
 * @param {object}              arSource
 * @param {THREE.WebGLRenderer} renderer
 */
export function syncSize(arSource, renderer) {
  arSource.onResizeElement()
  arSource.copyElementSizeTo(renderer.domElement)
}

// ─── Resize handler ───────────────────────────────────────────────────────────

/**
 * Build a window resize handler that keeps the AR source, AR controller
 * canvas, and Three.js renderer all in sync.
 *
 * Attach the returned function with:
 *   window.addEventListener('resize', createResizeHandler(arSource, arContext, renderer))
 *
 * @param {object}              arSource
 * @param {object}              arContext
 * @param {THREE.WebGLRenderer} renderer
 * @returns {Function}
 */
export function createResizeHandler(arSource, arContext, renderer) {
  return function onResize() {
    syncSize(arSource, renderer)
    if (arContext.arController) {
      arSource.copyElementSizeTo(arContext.arController.canvas)
    }
  }
}
