# Arteco Design System

This document is the **Single Source of Truth** for the visual appearance of the ecosystem.
**Audience:** Product Owner & Designers.
**Agent Instruction:** Use these tokens to configure `themeConfig.js` and CSS variables.

## 🎨 Color Palette (The Tokens)

| Token Name | Hex Value | Role | PO Notes |
| :--- | :--- | :--- | :--- |
| **Primary** | `#246A73` | Brand Identity | The core "Teal". Used for main actions, active tabs, and brand icons. |
| **Secondary** | `#007AFF` | Interaction | Standard link blue. Used for secondary highlights. |
| **Accent** | `#FFA800` | Highlights | Use sparingly for "New" items, warnings, or attention grabbers. |
| **Success** | `#059669` | Feedback | Success messages and completion indicators. |
| **Error** | `#ef4444` | Feedback | Error messages, destructive actions, and alerts. |
| **TextMain** | `#1e293b` | Readability | Main headings and body text. Dark slate, never pure black. |
| **TextSub** | `#64748b` | Metadata | Subtitles and descriptions. Subtle grey. |
| **Background**| `#f0f2f5` | Canvas | The main application background (Light Grey/Slate). |
| **Surface** | `#ffffff` | Content | Background for Cards, Modals, and Panels (Pure White). |
| **Border** | `#cbd5e1` | Structure | Borders, dividers, and input outlines. |

## 🔤 Typography

* **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
* **Base Size:** `16px`
* **Headings:** Bold weight, Tight letter spacing.
* **Body:** Regular weight, standard tracking.

## 📐 Shape & Depth

| Property | Value | Description |
| :--- | :--- | :--- |
| **Border Radius** | `6px` | Soft but professional. Not "bubbly". |
| **Shadows** | `0 2px 8px rgba(0,0,0,0.15)` | Subtle lift. No harsh drop shadows. |

## 🏗️ Layout & Chrome (The Shell)

To ensure a unified experience across the Portal and Sub-modules (ACM, Directory), the Application Shell must follow this structure.

* **Sidebar (`Sider`):**
    * **Theme:** `light` (matches `Surface` token).
    * **Behavior:** Collapsible (User controlled).
    * **Width:** Default `200px` / Collapsed `80px`.
    * **Logo Area:** Height `32px`, Margin `16px`.
* **Header:**
    * **Height:** `64px`.
    * **Background:** `Surface` token (`#ffffff`).
    * **Padding:** `0`.
    * **Elements:**
        1.  Collapse Trigger (Left).
        2.  **Contextual Title / Search** (Center). *Note: The Portal Landing places the Omni-Box in the page body.*
        3.  User Profile/Actions (Right).
* **Main Content:**
    * **Outer Margin:** `24px 16px` (Vertical/Horizontal gutter).
    * **Container:**
        * Background: `Surface` (`#ffffff`).
        * Padding: `24px`.
        * Radius: Matches `Border Radius` token.

## 👨‍💻 Engineering Implementation: The Theme Config

To ensure consistency across apps, all Frontends must use Ant Design's `ConfigProvider` with the following token mapping:

* **colorPrimary**: Use `Primary` token (`#246A73`)
* **colorLink**: Use `Secondary` token (`#007AFF`)
* **colorTextSecondary**: Use `TextSub` token (`#64748b`)
* **colorBgLayout**: Use `Background` token (`#f0f2f5`)
* **borderRadius**: `6px`
* **fontFamily**: Matches the stack defined above.

**Agent Instruction:** When creating new UIs, always create a `src/config/theme.js` file that exports this object and wrap the root App component in `<ConfigProvider theme={theme}>`.