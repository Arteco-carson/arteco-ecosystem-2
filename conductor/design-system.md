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

## 🏗️ Layout & Chrome (The Context-Sensitive Shell)

The ecosystem uses a **Unified Top-Navigation Shell**. This ensures a consistent brand identity while allowing individual applications (Contexts) to inject their own specific navigation tools.

### The Shell Contract
The `ArtecoShell` component is the master container. It provides the "Teal Ceiling" and standardizes the following slots:

* **1. The Brand Context (Left):**
    * **Dynamic Title:** Displays the name of the active module (e.g., "Arteco Portal", "Collection Manager").
    * **Typography:** White, Bold, 20px (`Inter`).
    * **Behavior:** Acts as the "Home" link for that specific module.

* **2. The Navigation Slot (Center-Left):**
    * **Context Aware:** The active application injects its primary navigation menu here.
    * **Portal Mode:** Empty (or Dashboard links).
    * **App Mode (e.g., ACM):** Displays module-specific tabs (e.g., "Artworks", "Artists", "Valuations").
    * **Style:** Text links, opacity 0.8 (default) -> 1.0 (hover/active). White text.

* **3. The Omni-Box Slot (Center-Right):**
    * **Global Search:** A persistent search bar available in all contexts.
    * **Behavior:** Context-aware (Searching in ACM prioritizes Artworks; searching in Portal looks everywhere).

* **4. User Actions (Right):**
    * **Profile:** Avatar + Name.
    * **Notifications:** Bell Icon.
    * **Settings:** Cog Icon.

### Visual Specs (The "Teal Header")
* **Type:** Fixed Top Bar (`position: sticky`).
* **Height:** `64px`.
* **Background:** `Primary` Token (`#246A73`).
* **Shadow:** `0 2px 8px rgba(0,0,0,0.15)`.
* **Padding:** `0 24px`.
* **Z-Index:** `1000` (Must float above all content).

### Main Content Area
* **Background:** `Background` Token (`#f0f2f5`).
* **Container:** Centered, Max-width `1200px` (Default).
* **Padding:** `24px` (Standard).

## 👨‍💻 Engineering Implementation: The Theme Config

To ensure consistency across apps, all Frontends must use Ant Design's `ConfigProvider` with the following token mapping:

* **colorPrimary**: Use `Primary` token (`#246A73`)
* **colorLink**: Use `Secondary` token (`#007AFF`)
* **colorTextSecondary**: Use `TextSub` token (`#64748b`)
* **colorBgLayout**: Use `Background` token (`#f0f2f5`)
* **borderRadius**: `6px`
* **fontFamily**: Matches the stack defined above.

**Agent Instruction:** When creating new UIs, always create a `src/config/theme.js` file that exports this object and wrap the root App component in `<ConfigProvider theme={theme}>`.