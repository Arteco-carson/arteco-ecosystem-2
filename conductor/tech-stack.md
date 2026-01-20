# Technology Stack

This document defines the technical foundation of the Arteco Ecosystem. It serves as a constraint and guide for engineering decisions. **Changes to this stack require architectural review.**

## 📱 Mobile App (`arteco-acm-mobile`)
*   **Framework**: React Native (via Expo 52)
*   **Language**: JavaScript/React 18
*   **Navigation**: React Navigation 7
*   **Storage**: Async Storage, Secure Store
*   **UI/Icons**: Lucide React Native

## 💻 Web Frontend (`arteco-acm-frontend`)
*   **Framework**: React 19
*   **UI Library**: Ant Design (antd 5.x)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios
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