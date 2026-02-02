# Design System Architecture

This document defines the **Structural** and **Templating** standards for the ecosystem.
**Strict Rule:** This documentation contains NO visual definitions (Hex codes, fonts, padding) EXCEPT where defining the core Brand Identity tokens. Visuals are strictly managed via **Style Templates** in the codebase.

## 🎨 Brand Identity (The "Arteco Blue")
* **Primary Brand Color**: `#0D0060` (Deep Blue). This is the anchor for the entire platform.
* **Typography**: `Lato` (Google Fonts). Used for all Headings and Body text.
* **Corner Radius**: `4px` (Sharp/Professional).
* **Iconography**: Ant Design Icons.
    * **Header Context**: MUST be White (`#FFFFFF`) for contrast against the Deep Blue shell.
    * **Page Context**: MUST use `token.colorPrimary` (`#0D0060`) to reinforce branding.

## 🛠️ Token Source (The "Style Engine")
Visual values are decoupled from components. Conductor and Developers must reference the semantic tokens, never raw values.

* **Token Source of Truth**: `packages/arteco-shared/src/config/theme.js` (or app-specific `theme.js`).
* **Implementation**: Ant Design `ConfigProvider` via the Shared Library.
* **Usage Rules**:
    * ❌ `color: '#246A73'` (Hardcoded - **FORBIDDEN**) - *Legacy Technical Debt to be refactored.*
    * ❌ `color: '#0D0060'` (Hardcoded - **AVOID**) - *Fragile.*
    * ✅ `color: token.colorPrimary` (Semantic - **REQUIRED**) - *Robust and Theme-aware.*

## 📐 Layout Templates
The application architecture is divided into distinct **Templates**. Each layout handles its own structure, responsive behavior, and style context.

### 1. The Public Template ("Magazine Style")
* **Context**: Unauthenticated / Landing / Marketing.
* **Structure**:
    * **Hero Section**: Edge-to-edge 55/45 split.
    * **Left Column**: Solid Brand Blue (`#0D0060`) with White/Ice-Blue typography.
    * **Right Column**: **Cross-Fading Slideshow** (Stacked Layers implementation) with an OmniBox overlay.
* **Component Reference**: `LandingPage.jsx` (in Portal).
* **Navigation**: Minimal/Hidden. Focused on "Entry" actions.
* **Theme Context**: Uses a specialized `ConfigProvider` to inject the Brand Blue into icons/buttons even outside the main shell.

### 2. The Ecosystem Shell (`ArtecoShell`)
* **Context**: Authenticated / Operational / Dashboard.
* **Structure**:
    * **Header**: Global Context (User Profile, OmniBox).
        * **Style**: Solid Deep Blue (`#0D0060`).
        * **Identity Logic**: Uses a **Pipe Separator** layout: `[Logo] | [Module Title]`.
        * **Scoped Theme**: The Header uses a **Nested `ConfigProvider`** to force all text and icons to **White** (`#FFFFFF`), overriding the global Blue theme.
    * **Sidebar**: Collapsible, Module Navigation.
    * **Content Area**: Pad-less container for Module injection.
* **Source**: `@arteco/shared` -> `<ArtecoShell>`.
* **Theme Context**: Uses the *Productivity* token set (Light Mode default).

## 🧩 Component Architecture
We do not build generic UI elements. We consume them from the library.

* **Base Library**: Ant Design (v6.x).
* **Custom Library**: `@arteco/shared`.
    * *Modals*: Use `<LoginModal>` for auth flows.
    * *Cards*: Use `Antd.Card` with the standard `shadow-sm` utility class.
    * *Buttons*: Always use `type="primary"` to automatically inherit the `colorPrimary` token.

## 📱 Mobile Templates
Mobile apps must mirror the Web Templates using Native primitives.

* **Public Flow**: `AuthStack` (Navigation).
* **Private Flow**: `AppTabs` (Navigation).
* **Styling Engine**: React Native `StyleSheet` referencing the **Shared Token Config** (JSON).