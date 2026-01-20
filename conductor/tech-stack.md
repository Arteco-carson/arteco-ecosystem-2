# Technology Stack

This document defines the technical foundation of the Arteco Ecosystem. It serves as a constraint and guide for engineering decisions. **Changes to this stack require architectural review.**

## 📱 Mobile Apps

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

### Art Collection Manager (`arteco-acm-frontend`)
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **UI Library**: Ant Design 6.x
*   **Icons**: Lucide React
*   **Routing**: React Router DOM 7

### Defect Reporting (`arteco-dr-frontend`)
*   **Framework**: React 19
*   **Build Tool**: Vite
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