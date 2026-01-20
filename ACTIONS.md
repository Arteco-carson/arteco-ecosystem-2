# Required Manual Actions

This file tracks tasks that require human intervention or configuration outside of the code.

## 1. Verify Azure Portal Environment Variables (Critical)
**Context:** The frontend migration to Vite changed the required environment variable from `REACT_APP_API_URL` to `VITE_API_URL`.
**Status:** The GitHub Actions workflow file has been updated to reflect this change.
**Action:** Log in to the Azure Portal -> Static Web Apps -> `agreeable-sky-071d8f90f` -> Configuration. Verify if `REACT_APP_API_URL` is defined there. If so, create a new variable named `VITE_API_URL` with the same value and delete the old one.
**Risk:** If environment variables are managed solely in the Portal (overriding the workflow), the app will fail to connect to the API in production.

## 2. Configure Test Runner
**Context:** The migration to Vite removed `react-scripts test`, which was the default test runner.
**Status:** Testing is currently disabled.
**Action:** Install and configure `vitest` (recommended for Vite) or manually configure Jest to restore testing capabilities.

## 3. Audit Codebase for Hardcoded Localhost (Critical for Cloud)
**Context:** The user noted potential changes involving `localhost`. While `localhost` is valid for development, it breaks Cloud deployments if hardcoded.
**Status:** Pending Audit.
**Action:** Search the entire codebase (especially `api.js`, `fetch` calls, and CORS settings) for `localhost` or `127.0.0.1`.
    *   **Frontend:** Ensure all API calls use `import.meta.env.VITE_API_URL`.
    *   **Mobile:** Ensure all API calls use `process.env.API_URL` (via `react-native-dotenv`).
**Risk:** The app will try to connect to the user's local machine from the Azure Cloud, resulting in connection timeouts.

## 4. Populate Design Tokens
**Context:** A new `conductor/design_tokens.md` file has been created to manage the changing colour palette and fonts.
**Action:** Fill in the `[INSERT]` placeholders in `conductor/design_tokens.md` using values from `arteco-frontend/src/index.css` (or similar) to establish the baseline.
