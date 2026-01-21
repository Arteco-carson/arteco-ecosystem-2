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
**Status:** Audit Complete. Hardcoded 'localhost' found in 'arteco-dr-mobile/src/config/env.js', 'arteco-dr-frontend/src/services/api.js', 'arteco-acm-frontend/src/api.js' and 'arteco-acm-frontend/src/components/api.js'.
**Action:** Search the entire codebase (especially `api.js`, `fetch` calls, and CORS settings) for `localhost` or `127.0.0.1`.
    *   **Frontend:** Ensure all API calls use `import.meta.env.VITE_API_URL`.
    *   **Mobile:** Ensure all API calls use `process.env.API_URL` (via `react-native-dotenv`).
**Risk:** The app will try to connect to the user's local machine from the Azure Cloud, resulting in connection timeouts.

## 4. Populate Design Tokens
**Context:** A new `conductor/design_tokens.md` file has been created to manage the changing colour palette and fonts.
**Action:** Fill in the `[INSERT]` placeholders in `conductor/design_tokens.md` using values from `arteco-frontend/src/index.css` (or similar) to establish the baseline.

## 5. File Cleanup (Post-Refactoring)
**Status:** Pending Manual Deletion (Agent unable to delete files).
**Context:** Following the standardization of `arteco-acm-frontend` to `.jsx` and the cleanup of the root directory, several files are now deprecated, redundant, or effective placeholders.
**Action:** Delete the following files to maintain repository hygiene.

**Root Directory:**
*   `Dashboard.jsx` (Deprecated/Duplicate)
*   `Login.jsx` (Deprecated/Duplicate)

**arteco-acm-frontend (Deprecated .js Components):**
*   `arteco-acm-frontend/Login.js`
*   `arteco-acm-frontend/src/components/Login.js`
*   `arteco-acm-frontend/src/components/Homepage.js`
*   `arteco-acm-frontend/src/components/MainLayout.js`
*   `arteco-acm-frontend/src/components/AddAppraisal.js`
*   `arteco-acm-frontend/src/components/AddArtistModal.js`
*   `arteco-acm-frontend/src/components/AddArtworkModal.js`
*   `arteco-acm-frontend/src/components/AppraisalList.js`
*   `arteco-acm-frontend/src/components/ArtistDetails.js`
*   `arteco-acm-frontend/src/components/ArtistList.js`
*   `arteco-acm-frontend/src/components/ArtworkDetails.js`
*   `arteco-acm-frontend/src/components/ArtworkList.js`
*   `arteco-acm-frontend/src/components/AuditLogs.js`
*   `arteco-acm-frontend/src/components/CollectionsList.js`
*   `arteco-acm-frontend/src/components/CreateCollection.js`
*   `arteco-acm-frontend/src/components/Navbar.js`
*   `arteco-acm-frontend/src/components/Profile.js`
*   `arteco-acm-frontend/src/components/Register.js`

**Review Candidates (Placeholder/Low Content):**
*   `conductor/product.md` (Currently contains only a generic description line. Verify if this should be populated or removed.)
*   `conductor/workflow.md` (Effective placeholder.)
*   `conductor/tracks.md` (Empty registry.)

**Backup & Temporary Files (To Remove):**
*   `arteco-acm-frontend/package.json.v1`
*   `arteco-acm-frontend/public/index.html.bak`
*   `arteco-acm-frontend/src/api.js.v1`
*   `arteco-acm-frontend/src/index.css.v1`
*   `conductor/product-guidelines.md.v1`
*   `.github/workflows/azure-static-web-apps-agreeable-sky-071d8f90f.yml.v1`
*   `file_structure.txt` (Root)
*   `FineArtApi/file_structure.txt`

**Legacy CRA Files (Unused in Vite):**
*   `arteco-acm-frontend/src/reportWebVitals.js`
*   `arteco-acm-frontend/src/setupTests.js`
*   `arteco-acm-frontend/src/App.test.js`
