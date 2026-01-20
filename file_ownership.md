# Conductor File Ownership Guide

This document outlines the ownership and purpose of the Conductor markup files within the Arteco Ecosystem. It serves as a reference for who is responsible for maintaining which parts of the project documentation.

## 🟢 Product Owner (The "What" & "Why")

These files define the business requirements, user experience, and visual identity. The Product Owner has the final say here.

### `conductor/product.md`
*   **Purpose:** Defines the high-level vision, business goals, and user personas.
*   **Responsibility:** Maintain the "North Star" vision. Ensure features align with these goals.

### `conductor/product-guidelines.md`
*   **Purpose:** Establishes the "vibe" of the product. Includes UX principles, tone of voice, and accessibility standards.
*   **Responsibility:** Define how the user should *feel* while using the app.

### `conductor/design_tokens.md`
*   **Purpose:** The Source of Truth for visual design primitives (Colours, Typography, Spacing).
*   **Responsibility:** Define the palette and font choices.
*   **Note:** Developers reference this file to implement CSS variables.

---

## 🔴 Engineering Team (The "How" & "Engine")

These files define the technical implementation, architecture, and constraints. Engineering leads own these definitions.

### `conductor/tech-stack.md`
*   **Purpose:** Lists the technologies, libraries, and architectural patterns used (e.g., React, Vite, .NET, Azure).
*   **Responsibility:** Ensure the stack is modern, secure, and maintainable. Document technical decisions.

### `ACTIONS.md`
*   **Purpose:** Tracks manual tasks that cannot be automated by code (e.g., Azure Portal configuration, Secret management).
*   **Responsibility:** Execute these tasks and update the status.

### `UPDATE_LOG.md`
*   **Purpose:** An automated log of changes made to the codebase during development sessions.
*   **Responsibility:** Review for history; usually automated by the AI Agent.

---

## 🟡 Joint Ownership (The "Process")

These files bridge the gap between Vision and Execution. They require agreement from both Product and Engineering.

### `conductor/tracks.md`
*   **Purpose:** The registry of active work streams (Features, Bugs, Chores).
*   **Responsibility:** Product prioritizes the tracks; Engineering updates status and feasibility.

### `conductor/workflow.md`
*   **Purpose:** Defines the rules of engagement (e.g., "How do we handle a hotfix?", "What is the Definition of Done?").
*   **Responsibility:** Both parties must agree on how to work together.