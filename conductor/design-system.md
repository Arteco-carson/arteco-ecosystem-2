# Design System Architecture

This document defines the **Structural** and **Templating** standards for the ecosystem.
**Strict Rule:** This documentation contains NO visual definitions (Hex codes, fonts, padding). Visuals are strictly managed via **Style Templates** in the codebase.

## 🎨 Token Source (The "Style Engine")
Visual values are decoupled from components. Conductor and Developers must reference the semantic tokens, never raw values.

* **Token Source of Truth**: `packages/arteco-shared/src/config/theme.js` (or similar `theme` export).
* **Implementation**: Ant Design `ConfigProvider` via the Shared Library.
* **Usage Rule**:
    * ❌ `color: '#246A73'` (Hardcoded - FORBIDDEN)
    * ✅ `color: token.colorPrimary` (Semantic - REQUIRED)

## 📐 Layout Templates
The application architecture is divided into distinct **Templates**. Each layout handles its own structure, responsive behavior, and style context.

### 1. The Public Template (`PublicLayout`)
* **Context**: Unauthenticated / Landing / Marketing.
* **Structure**: Single-column, vertical flow, centered content.
* **Component Reference**: `PublicWebsite` (in Portal).
* **Navigation**: Minimal/Hidden. Focused on "Entry" actions.
* **Theme Context**: Uses the *Intro/Cinematic* token set (Dark Mode default).

### 2. The Ecosystem Shell (`ArtecoShell`)
* **Context**: Authenticated / Operational / Dashboard.
* **Structure**:
    * **Sidebar**: Collapsible, Module Navigation.
    * **Header**: Global Context (User Profile, OmniBox).
    * **Content Area**: Pad-less container for Module injection.
* **Source**: `@arteco/shared` -> `<ArtecoShell>`
* **Theme Context**: Uses the *Productivity* token set (Light Mode default).

## 🧩 Component Architecture
We do not build generic UI elements. We consume them from the library.

* **Base Library**: Ant Design (v6.x)
* **Custom Library**: `@arteco/shared`
    * *Modals*: Use `<LoginModal>` for auth flows.
    * *Cards*: Use `Antd.Card` with the standard `shadow-sm` utility class.

## 📱 Mobile Templates
Mobile apps must mirror the Web Templates using Native primitives.

* **Public Flow**: `AuthStack` (Navigation).
* **Private Flow**: `AppTabs` (Navigation).
* **Styling Engine**: React Native `StyleSheet` referencing the **Shared Token Config** (JSON).