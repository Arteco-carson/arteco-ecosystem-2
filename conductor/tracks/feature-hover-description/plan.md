# Plan

## Context
- **Project:** `arteco-acm-frontend` (Art Collection Manager Web)
- **Tech Stack:** React 19, Ant Design 6.x, Vite
- **Brand Colors:** Uses `#246A73` (Primary) and `#64748b` (Secondary Text) per Product Guidelines.

## Tasks
- [x] **Define Data Structure:** In the dashboard page (likely `src/pages/Dashboard.jsx` or similar), define a constant array for the buttons containing: `id`, `label`, `icon` (Lucide React), and the new `description` text.
- [x] **Create Component:** Create `src/components/FeatureDescription.jsx`.
    - It should accept `description` (string) and `isVisible` (boolean) as props.
    - Use Ant Design's `<Typography.Text>` for the content.
    - Style it to use the "Secondary Text" color (`#64748b`) or "Brand Primary" (`#246A73`) for emphasis.
- [x] **Implement State:** In the parent page, use `useState` to track `hoveredFeatureId`.
- [x] **Add Interactions:** Update the existing Ant Design `<Button>` or Card elements:
    - `onMouseEnter={() => setHoveredFeatureId(feature.id)}`
    - `onMouseLeave={() => setHoveredFeatureId(null)}`
- [x] **Placement & Layout:** Insert `<FeatureDescription />` below the button row.
    - Ensure it has a fixed height (min-height) so the page layout doesn't jump when text appears/disappears.
- [x] **Responsive Logic:** Use Ant Design's `Grid` system (specifically the `useBreakpoint` hook or `<Row>`/`<Col>` responsiveness) to ensure this component returns `null` or is hidden on `xs` and `sm` screens.
- [x] **Animation:** Wrap the description in a simple fade-in using CSS transitions or a lightweight motion wrapper to meet the "impressive" requirement.
