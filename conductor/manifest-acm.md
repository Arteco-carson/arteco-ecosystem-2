# Manifest: Art Collection Manager (`arteco-acm`)

**Context:** The core domain module for Registrars.
**Type:** Single Page Application (SPA).

## 🏗️ Deployment Configuration
* **Base Path**: `basename="/acm"`.
    * This is critical. The app knows it lives in a subdirectory, not at the root.
    * Router: `BrowserRouter` wraps the app with this basename.

## 🧭 Navigation & Shell
* **Self-Definition**: ACM defines its own navigation items locally (`getAcmNavItems`).
* **Integration**: It passes these items to the shared `<ArtecoShell>`. This allows ACM to "look" like part of the platform while maintaining its own routing logic.

## 🔒 Security
* **Independent Gatekeeper**: ACM implements its own `ProtectedRoute` wrapper.
* **Why?** If a user bookmarks `/acm/dashboard`, they bypass the Portal entirely. ACM must independently verify the `localStorage` token exists.