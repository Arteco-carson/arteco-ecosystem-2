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
