# Manifest: Condition Reporting (`arteco-dr`)

**Context:** Defect and Condition reporting.
**Status:** High Priority - Next Phase Focus.

## 📱 Mobile Architecture (Native)
DR includes a fully featured Native Mobile App (`arteco-dr-mobile`).

### Tech Stack Constraints
* **Runtime**: Expo 54 (Managed Workflow).
* **Navigation**: React Navigation 7.
* **Storage**: `AsyncStorage` (Standard), `SecureStore` (Auth Tokens).
* **UI Library**: Lucide React Native (Icons).

### The Sync Gap & Network
* **Web**: Uses `localStorage` (Browser).
* **Mobile**: Uses `AsyncStorage` (Device).
* **Resilience**: Mobile implements a **10000ms Hard Timeout** on requests to handle poor connectivity in art storage bunkers.
    * *Dev Note*: Look for `[Network Debug]` logs in the Mobile console.

## 💻 Web Dashboard (`arteco-dr-frontend`)
* **Role**: The "Command Center" for reviewing reports submitted from mobile.
* **Data Structures**: The Mobile service calls `/Tenants`, implying multi-tenancy support is active.