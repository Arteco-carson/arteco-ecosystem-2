# Manifest: The Portal (`arteco-portal`)

**Context:** The Entry Point and "Launchpad".
**Architecture Pattern:** Gateway / Launchpad.

## 🌍 The "Split Brain" Environment
The Portal must handle authentication and routing across two distinct environments:

### 1. Local Development (The Proxy)
* **Problem**: Localhost cannot talk to Azure (HTTPS/CORS).
* **Solution**: `vite.config.js` contains a **Proxy**.
* **Flow**: App calls `/api/login` -> Vite Server -> Proxies to `...eastus2-01.azurewebsites.net`.

### 2. Production (The Variable)
* **Problem**: The Proxy does not exist in the Static Web App.
* **Solution**: We inject `VITE_API_URL` via `.env.production`.
* **Flow**: App calls `https://...azurewebsites.net/api/login` directly.
* **Critical File**: `packages/arteco-shared/src/components/LoginModal.jsx` explicitly handles this toggle.

## 🚀 Routing Strategy
The Portal is **not** a Micro-Frontend container (e.g., Module Federation). It acts as a **Launchpad**.

* **State Isolation**: The Portal does *not* share React Context or Redux state with sub-modules (ACM/DR).
* **Linking**: It uses standard browser navigation (`window.location.href`) to move users to `/acm/` or `/dr/`.
* **Session Persistence**: Because the token is in `localStorage`, the user remains logged in across these "hops".