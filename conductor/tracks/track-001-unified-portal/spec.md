# Track 001: Unified Portal MVP

## Goal
Create a visual "Shell" application that acts as the new landing page.

## 🛠️ Feature Requirements

### 1. The Layout (Shell)
* **Hero Section**: Centered "Omni-box" (The AI Input). Placeholder: "Ask Arteco..."
* **Navigation**: Minimal header. Logo (Left), Profile/Sign In (Right).

### 2. The Logic (Mocked AI)
* Input box must detect keywords:
    * "damage", "scratch" -> Returns Intent: 'DEFECT' -> Shows: Defect Reporting Card.
    * "move", "ship" -> Returns Intent: 'RELOCATION' -> Shows: Relocation Manager Card.
    * Default -> Returns Intent: 'SEARCH' -> Shows: Mock Search Results.

### 3. State: Logged Out vs. Logged In
* **Logged Out**: Show "Industry News" grid (dummy data).
* **Logged In**: Show "Quick Actions" dashboard (based on mock intent).