# Technology Stack

This document defines the technical foundation of the Arteco Ecosystem. It serves as a constraint and guide for engineering decisions. **Changes to this stack require architectural review.**

## 📱 Mobile Apps

### Directory Structure Standard
*   **Components**: `src/components/` (Reusable UI elements)
*   **Contexts**: `src/context/` (Global state)
*   **Screens**: `src/screens/` (App screens)
*   **Services**: `src/services/` (API calls, utilities)
*   **Config**: `src/config/` (Configuration, environment variables)

### Art Collection Manager (`arteco-acm-mobile`)
*   **Framework**: React Native (via Expo 54)
*   **Language**: JavaScript/React 19
*   **Navigation**: React Navigation 7
*   **Storage**: Async Storage, Secure Store
*   **UI/Icons**: Lucide React Native

### Defect Reporting (`arteco-dr-mobile`)
*   **Framework**: React Native (via Expo 54)
*   **Language**: JavaScript/React 19
*   **Navigation**: React Navigation 7
*   **Storage**: Async Storage, Secure Store
*   **UI/Icons**: Lucide React Native

## 💻 Web Frontends

### Directory Structure Standard
*   **Components**: `src/components/` (Reusable UI elements)
*   **Contexts**: `src/context/` (Global state, e.g., `AuthContext`)
*   **Pages**: `src/pages/` (Web)
*   **Services**: `src/services/` (API calls, utilities)
*   **Assets**: `src/assets/` (Images, fonts)

### Art Collection Manager (`arteco-acm-frontend`)
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **File Extension Standard**: `.jsx` for all React components
*   **UI Library**: Ant Design 6.x
*   **Icons**: Lucide React
*   **Routing**: React Router DOM 7

### Defect Reporting (`arteco-dr-frontend`)
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **File Extension Standard**: `.jsx` for all React components
*   **UI Library**: Ant Design 6.x
*   **Routing**: React Router DOM 7

## ☁️ Backend API (`FineArtApi`)
*   **Framework**: .NET 8 Web API
*   **Database ORM**: Entity Framework Core 8 (SQL Server)
*   **Storage**: Azure Storage Blobs
*   **Authentication**: JWT Bearer Tokens
*   **Documentation**: Swagger / Swashbuckle

## 🛠️ Infrastructure & Tools
*   **Hosting**: Azure Static Web Apps (Frontends)
*   **CI/CD**: GitHub Actions (Workflows in `.github/workflows`)
*   **Version Control**: Git