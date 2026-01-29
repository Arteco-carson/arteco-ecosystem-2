# Product Guidelines

This document provides guidelines for product development, including UI/UX principles, accessibility standards, and content style guides.

**Note:** For visual definitions (Colors, Fonts, Shapes), please refer to the **[Design System](./design-system.md)**.

## 🧭 Experience Principles

### 1. Intent-First Navigation
* **Don't make me hunt.** The user should be able to state their goal (e.g., "Report Damage") rather than navigating complex menus.
* **Context is King.** If a user is looking at an Artwork, relevant actions (Appraise, Move, Report) should be immediately visible.

### 2. Tone of Voice
* **Professional but Approachable.** We deal with high-value assets, so trust is paramount. Avoid slang, but do not be overly robotic.
* **Clear & Direct.** Error messages should explain *what* went wrong and *how* to fix it. Avoid generic "System Error" messages.

### 3. Accessibility (A11y)
* **Color Contrast:** Always ensure text meets WCAG AA standards against background colors.
* **Screen Readers:** All functional images (icons) must have `aria-label` or `alt` text. Decorative images should be hidden from screen readers.
* **Keyboard Nav:** All interactive elements must be reachable via the `Tab` key.

## 🚦 Interaction Guardrails

* **Destructive Actions:** Any action that deletes data (e.g., removing an artwork) must require a confirmation modal.
* **Loading States:** Never show a blank screen. Use skeleton loaders or spinners to indicate activity for any request taking >500ms.
* **Feedback:** Always provide immediate visual feedback on button clicks (e.g., button state change, toast notification).