# Technology Stack

This document defines the technical foundation of the Arteco Ecosystem. For implementation details, see the specific **Manifests**.

## 🏗️ Core Architecture (The Modular Monorepo)
We follow a **Shell & Module** architecture managed via NPM Workspaces.

| Component | Manifest Link | Description |
| :--- | :--- | :--- |
| **Backend** | [manifest-backend.md](./manifest-backend.md) | .NET 8 API, SQL, & Auth Contracts. |
| **Shared Lib** | [manifest-shared.md](./manifest-shared.md) | UI Kit, Auth Context, & Design Tokens. |
| **Portal** | [manifest-portal.md](./manifest-portal.md) | The Gateway/Launchpad. Handles env routing. |
| **ACM** | [manifest-acm.md](./manifest-acm.md) | Collection Management SPA. |
| **DR** | [manifest-dr.md](./manifest-dr.md) | Condition Reporting (Web + Mobile). |

## 📦 Shared Libraries (`@arteco/shared`)
**Constraint:** All Web Modules MUST import core logic from here.
* **Network**: `api` (Pre-configured Axios with Interceptors).
* **Auth**: `useAuth` (Token management).
* **UI**: `ArtecoShell` (The standard Header/Layout).

## ☁️ Deployment Strategy
* **Infrastructure**: Azure Static Web Apps (SWA).
* **Environment Variables**:
    * **Local**: Handled via `vite.config.js` Proxy.
    * **Production**: Handled via `.env.production` injection (`VITE_API_URL`).