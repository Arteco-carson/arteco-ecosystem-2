# Manifest: Shared Core (`@arteco/shared`)

**Context:** The "Standard Library" for all Arteco Web Apps.
**Rule:** If it's UI or Auth, it lives here. Do not rebuild it in the apps.

## 🎨 The Design System (Implementation)
While `design-system.md` defines the *look*, this package handles the *code*.

* **Theme Config**: `src/config/theme.js`
    * **Primary Token**: `colorPrimary: '#0D0060'` (Arteco Deep Blue).
    * **Typography**: `Lato` (Sans-Serif).
* **Local Overrides**: Be aware that `ArtecoShell.jsx` currently duplicates the color constant as `ARTECO_DEEP_BLUE`. *Refactor Target: Unify this.*

## 🐚 The Shell Architecture
**Current State:** Top Navigation (Header-only).
* **Structure**: `<Layout>` > `<Header>` + `<Content>`.
* **Behavior**: The Shell accepts a `navItems` prop. These are rendered as **Buttons** in the Header, not links in a Sidebar.
* *Note: This deviates from the original "Sidebar" design specification.*

## 🛡️ Authentication (Client-Side)
* **Storage Strategy**: `localStorage`. Key: `'token'`.
* **Validation**: Naive Check (`!!token`).
    * The client checks *existence*, not *validity*.
    * If the token is expired, the API will return `401`, and the `axios` interceptor (in `api.js`) will catch it and redirect to login.