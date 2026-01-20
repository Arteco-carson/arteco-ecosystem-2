# Project Rules for Gemini

## 1. Handling Placeholders & Instructions
In project documentation (especially `product.md` and `tech-stack.md`), you will encounter lines enclosed in square brackets or blockquotes.

* **Syntax Examples:** `[ACTION: Describe this]`, `[INSERT: 1-2 sentences]`, or `> [TODO: ...]`
* **Human Only:** These are instructions for human collaborators.
* **Ignore for Context:** Do NOT treat the text inside these brackets as factual project requirements or business rules.

## 2. Interpreting "Empty" Sections
If a section (e.g., "## Vision" or "## Authentication") contains **only** these placeholders:
* **Status:** Treat that section as **Undefined / Empty**.
* **Action:** Do not guess the content. If a specific Track requires information from that section, you must **ask the user** to clarify or provide the missing details during the `newTrack` interview.

## 3. Coding Standards
* **Source of Truth:** Always prioritize patterns found in `conductor/tech-stack.md` (and specifically the "Development Guidelines" section) over general best practices.
* **Consistency:** If the guidelines are missing, match the style of existing files in the `@src` directory.