# 🌍 Campus Geothermal AR Experience

![Three.js](https://img.shields.io/badge/Three.js-r152-black?logo=three.js)
![AR.js](https://img.shields.io/badge/AR.js-3.4.5-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

## Overview

Campus Geothermal AR is part of a series web-based Augmented Reality applications that makes sustainability efforts visible to college students. By using their phone camera to scan QR codes students see a live visualization of energy flowing from the campus geothermal source to the devices powering their environment.
The goal is to transform an invisible, abstract concept into something students can see, interact with, and feel personally connected to. No app download required — the experience runs entirely in the mobile browser.

---

## Features

### Milestone 1 — Core AR Experience ✅ (Currently Working On)
- Single AR marker detection anchored to a classroom 
- Glowing geothermal origin point with pulse animation rendered below the floor in AR space
- Floating info badge displaying human-readable energy equivalencies (e.g. *"Heating 30 students right now"*)
- Mock energy data layer with an API-ready schema ready for live data in Milestone 3
- HTTPS-enabled local development for mobile camera access

### Milestone 2 — Full Room Scan 🔲 (Planned)
- Multi-marker support scanning an entire classroom simultaneously
- "What if" interaction layer — tap a fixture to explore energy savings scenarios
- Human-readable CO₂ and cost equivalencies across all fixtures
- Campus comparison view showing building-level energy draw

### Milestone 3 — Live Data & Campus Scale 🔲 (Planned)
- Node/Express backend connected to real campus geothermal energy data
- Persistent world anchors across sessions
- Campus-wide energy map overlay
- Shareable AR screenshot with generated energy stats

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | r152 | 3D rendering, particle systems, animation loop |
| [AR.js](https://ar-js-org.github.io/AR.js-Docs/) | 3.4.5 | Web-based AR, marker detection, camera feed |
| [Vite](https://vitejs.dev/) | 5.0 | Local dev server with HTTPS, hot reload, module bundling |
| [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) | latest | Self-signed SSL cert for local HTTPS (required for camera access) |
| Vanilla JavaScript | ES6+ | No frontend framework — keeps the bundle lean |
| Node.js / Express | 20 LTS / 4.x | Backend API for live energy data *(Milestone 3)* |

---

## Demo Project Structure

```
campus-geothermal-ar/
├── src/
│   ├── components/             # Reusable Three.js objects
│   │   ├── ParticleStream.js   # Energy flow particle system (source → target)
│   │   ├── GeothermalSource.js # Glowing underground heat origin point
│   │   └── InfoBadge.js        # CSS2DRenderer floating fixture label
│   ├── data/
│   │   └── room-fixtures.json  # Mock energy data (API-ready schema)
│   ├── markers/                # AR.js marker pattern files (.patt)
│   │   ├── hiro.patt           # Standard AR.js test marker
│   │   └── hvac-vent.patt      # Custom HVAC fixture marker
│   ├── scene/
│   │   └── index.js            # Three.js + AR.js scene, shared renderer and animation loop
│   └── utils/
│       ├── arToolkit.js        # AR.js initialization helpers (ArToolkitSource, ArToolkitContext)
│       ├── dataLoader.js       # Abstracts JSON vs future API data fetching
│       └── fixtureManager.js   # Manages marker → fixture lifecycle (ParticleStream, Badge, Source)
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## Getting Started

⚠️ **Heads up!** This project is currently a work in progress. The code is not yet in a runnable state — check back later

### Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** v20 LTS or higher — [Download here](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- A **modern mobile browser** (Chrome on Android or Safari on iOS) for AR testing
- A **webcam** for desktop testing

Verify your Node version:
```bash
node --version   # Should output v20.x.x or higher
npm --version    # Should output 9.x.x or higher
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/XR-Prototype.git
cd XR-Prototype.git
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server with HTTPS enabled:
```bash
npm run dev
```

The terminal will output something like:
```
  VITE v5.0.0  ready in 500ms

  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.x:5173/
```

Open `https://localhost:5173/` in your browser. You will see a security warning about the self-signed certificate — click **Advanced → Proceed** to continue. This is expected and safe for local development.

> ⚠️ **Important:** The `http://` version will not work. AR.js requires camera access which browsers only grant over HTTPS.

### Testing on Mobile

Mobile testing requires your phone and computer to be on the **same WiFi network**.

1. Start the dev server with the host flag:
```bash
npm run dev -- --host
```

2. Note the `Network` URL from the terminal output (e.g. `https://192.168.1.x:5173/`)

3. Open that URL on your phone's browser

4. Accept the certificate warning (Advanced → Proceed)

5. Grant camera permission when prompted

6. Point the camera at a printed AR marker 

---


## Milestone Roadmap

```
M1 (Current)          M2 (Next)              M3 (Future)
─────────────         ─────────────          ─────────────
Single marker    →    Multi-marker      →    Live API data
Particle stream       Full room scan         Campus map
Mock data             What-if layer          World anchors
Info badge            Campus compare         Share feature
```

---

## Architecture

### Component Overview

```
AR.js (Camera + Marker Detection)
        │
        ▼
fixtureManager.js          ← owns the marker → fixture lifecycle
   │        │
   ▼        ▼
ParticleStream.js      InfoBadge.js
GeothermalSource.js
(uploading visualizations for site)
   │                        │
   └──────────┬─────────────┘
              ▼
     Three.js WebGLRenderer + CSS2DRenderer
              │
              ▼
        dataLoader.js
              │
              ▼
     room-fixtures.json (M1–M2)
     Express API (M3)
```

### Data Flow

When a marker is detected by AR.js, `fixtureManager.js` looks up the corresponding fixture data via `dataLoader.js`, then simultaneously instantiates a `GeothermalSource`, a `ParticleStream` flowing from the source to the marker anchor, and an `InfoBadge` displaying the fixture's energy equivalency. All three are destroyed or paused when the marker is lost.

---

## Test Cases

### Test Case 1 — AR Pipeline Smoke Test
**Description:** Verifies the Three.js and AR.js pipeline is connected end-to-end.
**Input:** Print and display the `hiro.patt` marker in front of the camera.
**Expected Output:** A white cube appears anchored to the marker and tracks with camera movement.
**Pass Criteria:** Cube remains stable on the marker for 5+ seconds with no console errors.

### Test Case 2 — Mobile HTTPS Camera Access
**Description:** Verifies the app loads and requests camera permission correctly on a mobile device.
**Input:** Open the Network URL on a mobile browser (Chrome/Safari) on the same WiFi network.
**Expected Output:** Browser prompts for camera permission. After granting, the live camera feed fills the screen.
**Pass Criteria:** Camera feed renders without errors. No HTTP/HTTPS mixed-content warnings in the browser console.

---

## Future Considerations

This prototype is built in JavaScript/Three.js/AR.js to validate the concept quickly. As the project grows beyond Milestone 3, a migration to **Unity with AR Foundation** (ARKit/ARCore) is the natural upgrade path. This unlocks hardware-accelerated tracking, real plane detection, and surface anchoring — meaning virtual energy streams could literally flow along detected floor and wall surfaces rather than floating in mid-air.

The 3D assets (GLTF format) and the Node/Express data API built in this prototype transfer directly into Unity, so the migration cost is isolated to the rendering and AR layers only.

---
