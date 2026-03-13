<p align="center">
  <strong>ᚦ ᚱ ᚲ ᚷ ᚹ ᛁ ᛃ ᛈ</strong>
</p>

<h1 align="center">MECHANIZED 26</h1>

<p align="center">
  <em>Viking-themed IoT Control Dashboard for ESP32 LED Strip Automation</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/MQTT-5.x-660066?logo=mqtt&logoColor=white" alt="MQTT" />
  <img src="https://img.shields.io/badge/ESP32-Supported-E7352C?logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/License-Private-red" alt="License" />
</p>

---

## 📖 Overview

**MECHANIZED 26** is a real-time IoT control dashboard built with React and Vite that communicates with an ESP32 microcontroller over MQTT to manage **8 individually-addressable WS2812B LED strips**. The interface draws inspiration from Norse mythology and Viking craftsmanship, featuring Elder Futhark rune iconography, animated forge-style energy lines, and an immersive dark aesthetic.

When all 8 strips are activated, the dashboard automatically triggers a relay on the ESP32 — completing the "ritual" and powering an external device.

### How It Works

```
┌────────────────────┐         MQTT (WSS)        ┌────────────────────┐
│                    │ ──── Command (start) ────> │                    │
│   React Dashboard  │                            │   ESP32 + LEDs     │
│   (This Repo)      │ <─── Status / Progress ──  │   (Firmware)       │
│                    │ <─── State Restore ──────  │                    │
│                    │ ──── Relay ON ──────────>  │                    │
└────────────────────┘                            └────────────────────┘
         │                                                 │
         └──────────── HiveMQ Cloud Broker ────────────────┘
```

---

## ✨ Features

### 🎮 Interactive Control
- **8 Rune-Themed Buttons** — Each button represents an Elder Futhark rune (ᚦ Thurisaz, ᚱ Raido, ᚲ Kaunan, ᚷ Gebo, ᚹ Wunjo, ᛁ Isaz, ᛃ Jera, ᛈ Pertho), mapped to individual LED strips
- **Sequential Activation** — Only one strip can be activated at a time, preventing conflicts
- **Real-Time Progress Tracking** — Visual progress bar updates as the ESP32 lights up each strip
- **Automatic Relay Trigger** — When all 8 strips are completed, a relay command is automatically sent

### 🌳 Visual Effects
- **Animated Energy Branch Lines** — SVG-based tree-branch paths connect each button to the logo, with traveling ember particles on active branches
- **Viking Forge Palette** — Each branch uses a unique fire/ember color with gradient glow effects
- **Powered Logo Animation** — The "MECHANIZED 26" logo transforms when all strips are activated
- **Status Toast Notifications** — Animated enter/exit status messages with progress bar

### 🌐 Real-Time Communication
- **MQTT over Secure WebSockets (WSS)** — Encrypted communication with HiveMQ Cloud
- **Auto-Reconnection** — Automatically reconnects and re-subscribes on connection loss
- **ESP32 Presence Detection** — Real-time online/offline status via Last Will and Testament (LWT)
- **State Restoration** — Dashboard restores button states from retained MQTT messages on reconnect

---

## 🏗️ Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| **Framework**    | React 19 with Hooks (`useReducer`, `useRef`)  |
| **Build Tool**   | Vite 6.2 with `@vitejs/plugin-react`          |
| **IoT Protocol** | MQTT 5 via `mqtt.js` (WebSocket transport)    |
| **Broker**       | HiveMQ Cloud (TLS/WSS on port 8884)           |
| **Typography**   | Google Fonts — MedievalSharp, Cinzel           |
| **Styling**      | Vanilla CSS with custom properties            |
| **Deployment**   | Static build served via `serve` (or any CDN)  |
| **Hardware**     | ESP32 + WS2812B LED strips + Relay module     |

---

## 📁 Project Structure

```
frontend/
├── index.html                  # Entry HTML with meta tags & Google Fonts
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite config (port, host, global polyfill)
├── .env                        # MQTT broker credentials (gitignored)
├── .gitignore                  # Git ignore rules
│
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component — assembles layout
    ├── index.css               # Global styles (Viking theme, animations)
    │
    ├── components/
    │   ├── Logo.jsx            # "MECHANIZED 26" title + connection status
    │   ├── ButtonGrid.jsx      # Renders 8 LedButton components in a grid
    │   ├── LedButton.jsx       # Individual rune button (idle/running/completed)
    │   ├── EnergyLines.jsx     # SVG overlay — animated branch paths + embers
    │   └── StatusToast.jsx     # Ephemeral status text + progress bar
    │
    ├── context/
    │   └── MechanizeContext.jsx # Global state (useReducer) + MQTT event handlers
    │
    └── mqtt/
        ├── mqttClient.js       # MQTT connection, pub/sub, reconnection logic
        └── topics.js           # Topic constants and helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** v9+ (bundled with Node.js)
- **MQTT Broker** — a running broker (HiveMQ Cloud, Mosquitto, etc.)
- *(Optional)* **ESP32** flashed with the MECHANIZED 26 firmware

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/mechanized-26-frontend.git
cd mechanized-26-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (this file is gitignored):

```env
# MQTT Broker Configuration
VITE_MQTT_BROKER_URL=wss://your-broker-host:8884/mqtt
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

| Variable                 | Description                                                  | Default                  |
| ------------------------ | ------------------------------------------------------------ | ------------------------ |
| `VITE_MQTT_BROKER_URL`   | WebSocket URL of the MQTT broker                             | `ws://localhost:9001`    |
| `VITE_MQTT_USERNAME`     | Broker authentication username                               | *(none)*                 |
| `VITE_MQTT_PASSWORD`     | Broker authentication password                               | *(none)*                 |

> **Note:** Variables prefixed with `VITE_` are exposed to the client-side bundle by Vite. Do **not** commit secrets to version control.

### 4. Start the Development Server

```bash
npm run dev
```

The app will open automatically at `http://localhost:5173` (or the port set by the `PORT` env variable).

### 5. Build for Production

```bash
npm run build
```

The optimized static files are output to the `dist/` directory. You can preview the production build with:

```bash
npm run preview
```

Or serve it directly:

```bash
npm start
```

This uses `serve` to host the `dist/` folder on port 3000 (or `$PORT`).

---

## 📡 MQTT Topics & Protocol

The dashboard communicates with the ESP32 firmware via the following MQTT topics:

### Published by Dashboard → ESP32

| Topic                            | Payload Example                              | Description                                |
| -------------------------------- | -------------------------------------------- | ------------------------------------------ |
| `mechanize/cmd/button{1-8}`      | `{"action":"start","strip":1}`               | Command to activate LED strip 1–8          |
| `mechanize/relay`                | `ON`                                         | Triggers the relay (retained message)      |

### Published by ESP32 → Dashboard

| Topic                   | Payload Example                                              | Description                                  |
| ----------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `mechanize/status`      | `{"button":1,"phase":"running"}`                             | Strip status update (`command_received`, `running`, `completed`) |
| `mechanize/progress`    | `{"button":1,"current":42,"total":100}`                      | LED animation progress for active strip      |
| `mechanize/state`       | `{"buttons":["idle",...],"activeButton":-1,"relayActive":false}` | Full state restore (retained)               |
| `mechanize/esp_status`  | `online` / `offline`                                         | ESP32 presence (LWT for offline)             |

### Status Phases

```
idle → command_received → running → completed
```

Each button progresses through these phases. When all 8 reach `completed`, the relay is automatically triggered after a 2-second delay.

---

## 🎨 UI Components

### Logo (`Logo.jsx`)
Displays the **"MECHANIZED 26"** title with a decorative rune border (`ᛟ ᚱ ᛞ ᛖ ᚱ`). Shows real-time connection status:
- 🟢 **Forge Connected** — MQTT connected and ESP32 online
- 🟡 **Awaiting Forge** — MQTT connected but ESP32 offline
- 🔴 **Disconnected** — No MQTT connection

### Button Grid (`ButtonGrid.jsx` + `LedButton.jsx`)
A responsive grid of 8 rune-themed buttons with three visual states:
- **Idle** — Displays rune icon and name, clickable
- **Running** — Animated spinning ring, button disabled
- **Completed** — Shows completion mark (᛭), button disabled

### Energy Lines (`EnergyLines.jsx`)
Full-screen SVG overlay rendering animated tree-branch paths from each button to the logo:
- **Inactive** — Lines are invisible
- **Active** — Fire-gradient strokes with traveling ember particles and glow filters
- **Completed** — Faint residual trace with slow-moving particle

### Status Toast (`StatusToast.jsx`)
Bottom-mounted notification area showing:
- Status text with enter/exit CSS animations
- Progress bar fill synced to the current strip's lighting progress

---

## ⚙️ State Management

State is managed via React's `useReducer` inside `MechanizeContext`. Key state shape:

```js
{
  buttons: ['idle', ...],   // 8 values: 'idle' | 'running' | 'completed'
  activeButton: null,       // Index of currently running button (0-7) or null
  progress: 0,              // 0-100 progress of the active strip
  statusText: '',           // Current status message
  statusVisible: false,     // Whether status toast is shown
  allComplete: false,       // True when all 8 strips are completed
  relayActive: false,       // True after relay command is sent
  mqttConnected: false,     // MQTT broker connection status
  espOnline: false,         // ESP32 online presence
}
```

### Actions

| Action Type        | Description                                      |
| ------------------ | ------------------------------------------------ |
| `START_BUTTON`     | Marks a button as running and sets it as active   |
| `SET_PROGRESS`     | Updates the progress percentage                   |
| `BUTTON_COMPLETE`  | Marks a button as completed, checks all-complete  |
| `SET_STATUS_TEXT`   | Shows an ephemeral status message                 |
| `HIDE_STATUS`      | Hides the status toast                            |
| `SET_RELAY`        | Records that the relay has been triggered          |
| `SET_MQTT_CONNECTED` | Updates MQTT connection state                   |
| `SET_ESP_ONLINE`   | Updates ESP32 presence                            |
| `RESTORE_STATE`    | Restores full state from retained MQTT message    |
| `RESET_ALL`        | Resets to initial state (preserving connection)   |

---

## 🛠️ Available Scripts

| Command            | Description                                        |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start Vite dev server with HMR                     |
| `npm run build`    | Build production bundle to `dist/`                 |
| `npm run preview`  | Preview the production build locally               |
| `npm start`        | Serve `dist/` with `serve` on port 3000            |

---

## 🔧 Configuration

### Vite Configuration (`vite.config.js`)

- **Port**: Reads from `PORT` env variable, defaults to `5173`
- **Host**: Binds to `0.0.0.0` (accessible on local network)
- **Auto-Open**: Opens browser on dev server start
- **Global Polyfill**: Sets `global = globalThis` for `mqtt.js` compatibility

### Fonts

The app uses three Google Fonts loaded via CDN:
- **MedievalSharp** — Decorative medieval-style font
- **Cinzel** (weights 400–900) — Elegant serif for headings
- **Cinzel Decorative** (weights 400, 700, 900) — Ornamental variant

---

## 🌍 Deployment

Since this is a static Vite build, it can be deployed to any static hosting provider:

### Render / Railway
1. Set the build command to `npm run build`
2. Set the publish directory to `dist/`
3. Add environment variables (`VITE_MQTT_*`) in the dashboard

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "dist", "-l", "3000"]
```

---

## 🩺 Troubleshooting

| Symptom                              | Cause                                    | Fix                                                      |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| "Disconnected" status in logo        | Broker URL incorrect or unreachable      | Verify `VITE_MQTT_BROKER_URL` in `.env`                  |
| "Awaiting Forge" but ESP32 is on     | ESP32 not publishing to `esp_status`     | Check ESP32 firmware MQTT config and LWT settings         |
| Buttons don't respond                | Another strip is running                 | Wait for the active strip to complete                     |
| Progress bar not moving              | ESP32 not publishing progress messages   | Verify firmware publishes to `mechanize/progress`         |
| Relay never triggers                 | Not all 8 buttons completed              | Ensure all 8 strips reach `completed` state               |
| `global is not defined` error        | Missing polyfill for `mqtt.js`           | Ensure `define: { global: 'globalThis' }` in Vite config |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📜 Related Repositories

| Repository          | Description                                |
| ------------------- | ------------------------------------------ |
| **mechanized-26-firmware** | ESP32 Arduino firmware for LED + relay control |
| **mechanized-26-backend**  | *(If applicable)* Backend API services     |

---

<p align="center">
  <strong>⚒️ Forged with Fire & Code ⚒️</strong><br/>
  <em>MECHANIZED 26 — Where Viking lore meets modern IoT</em>
</p>
