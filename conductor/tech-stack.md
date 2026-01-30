# Technology Stack

This document defines the technical foundation of the Arteco Ecosystem. It serves as a constraint and guide for engineering decisions. **Changes to this stack require architectural review.**

## 🏗️ Core Architecture (The Monorepo)
All **Web** applications now live in a unified NPM Workspace structure.

### Workspace Map
* **Root**: `.` (Manages `package.json`, generic build scripts)
* **Shared Lib**: `packages/arteco-shared` (The `@arteco/shared` library)
* **Portal**: `arteco-portal` (The Host/Shell)
* **ACM Web**: `arteco-acm-frontend` (Collection Manager Module)
* **DR Web**: `arteco-dr-frontend` (Defect Reporting Module)

## 📦 Shared Libraries (`@arteco/shared`)
**Constraint:** All Web Modules MUST import core logic from here. Do not duplicate.
* **Auth**: `AuthProvider`, `useAuth` (Manages `localStorage` token)
* **UI Layout**: `ArtecoShell` (The standard Blue Sidebar & Header)
* **Components**: `LoginModal` (The standard Auth pop-up)
* **Network**: `api` (Pre-configured Axios instance with Authorization headers)

---

## 💻 Web Frontends

### Directory Structure Standard
* **Components**: `src/components/`
* **Contexts**: `src/context/` (App-specific state only. Use Shared for Auth.)
* **Pages**: `src/pages/`
* **Services**: `src/services/` (App-specific API calls)

### Unified Portal (`arteco-portal`)
* **Role**: Entry Point. Hosts the Public Landing Page and wraps Sub-Modules.
* **Framework**: React 19 + Vite + Ant Design 6.
* **Port**: `5173` (Default Dev)

### Art Collection Manager (`arteco-acm-frontend`)
* **Role**: Domain Module.
* **Constraint**: Must be wrapped in `<ArtecoShell>` when running in Dev.
* **Port**: `5174` (Default Dev)

### Defect Reporting (`arteco-dr-frontend`)
* **Role**: Domain Module.
* **Port**: `5175` (Default Dev)

---

## 📱 Mobile Apps
*Note: Mobile apps currently live outside the NPM Workspaces link but share the Backend.*

### Directory Structure Standard
* **Components**: `src/components/`
* **Contexts**: `src/context/`
* **Screens**: `src/screens/`
* **Services**: `src/services/`
* **Config**: `src/config/`

### Art Collection Manager (`arteco-acm-mobile`)
* **Framework**: React Native (via Expo 54)
* **Language**: JavaScript/React 19
* **Navigation**: React Navigation 7
* **Storage**: Async Storage, Secure Store
* **UI/Icons**: Lucide React Native

### Defect Reporting (`arteco-dr-mobile`)
* **Framework**: React Native (via Expo 54)
* **Navigation**: React Navigation 7

---

## ☁️ Backend API (`FineArtApi`)
* **Framework**: .NET 8 Web API
* **Database**: SQL Server (Entity Framework Core 8)
* **Auth**: JWT Bearer Tokens (Shared Secret)
* **Storage**: Azure Storage Blobs