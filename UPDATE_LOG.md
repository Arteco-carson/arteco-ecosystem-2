# Update Log

## 2026-01-20
- **Standardization**: Updated `conductor/tech-stack.md` to enforce `.jsx` file extensions for all React components in Vite-based web frontends (`arteco-acm-frontend` and `arteco-dr-frontend`).
- **Refactoring**: Refactoring `arteco-acm-frontend` to align with the new standard:
    - Renaming entry point `index.js` to `main.jsx`.
    - Renaming `App.js` to `App.jsx`.
    - Renaming all component files in `src/components/` from `.js` to `.jsx`.
    - Updating `index.html` entry point reference.

## 2026-01-21
- **Bug Fix (CORS)**: Updated `FineArtApi/Program.cs` to resolve CORS errors for the Defect Reporting Portal.
    - Added `https://calm-bay-0e5fc840f.6.azurestaticapps.net` to the allowed origins list.
    - Enabled `.AllowCredentials()` in the CORS policy to support authentication cookies (ARRAffinity).
