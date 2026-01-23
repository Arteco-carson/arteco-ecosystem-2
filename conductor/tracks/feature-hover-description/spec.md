# Feature: Hover-over description of frontpage buttons

## Goal
Fill screen space and guide the user by displaying dynamic descriptions of features when they hover over main menu buttons.

## Context
**Target App:** `arteco-acm-frontend` (Art Collection Manager Web)

In order to give more context to a user, and make the screen feel fuller, when a button is hovered over, give a description below the buttons of what that feature does. Span the width of the buttons and make it feel impressive.

## Requirements
- [x] **Trigger:** Activate description display on `mouseenter`; clear on `mouseleave`.
- [x] **Content:** Manage descriptions in a centralized config (clean code).
- [x] **UI/UX:**
    - Use **Ant Design 6.x** components (Typography, Card/Grid).
    - Use `Primary` color (`#246A73`) for active state or `Secondary` text color (`#64748b`) for the description text.
    - Animation should feel smooth (fade in/out).
- [x] **Mobile:** This feature must be **hidden** on mobile devices (use Ant Design responsive breakpoints).

## Tech Constraints
- Framework: React 19 + Vite
- Styling: Ant Design (No raw CSS unless absolutely necessary)
- Icons: Lucide React
