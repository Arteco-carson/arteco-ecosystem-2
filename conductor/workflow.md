# Engineering Workflow

This document defines the **Standard Operating Procedures** for development within the Arteco Monorepo.

## 🛠️ The Monorepo Protocol
We use **NPM Workspaces** to manage dependencies.
* **Rule #1:** ALWAYS run `npm install` from the **Root**.
* **Rule #2:** NEVER install `axios` or `antd` in individual apps if they are already in `@arteco/shared`.

### 🔑 Key Commands
| Action | Command (Run from Root) | Context |
| :--- | :--- | :--- |
| **Start Portal** | `npm run dev` | Starts the Host App + Auth |
| **Start ACM** | `npm run dev:acm` | Starts Collection Manager (Port 5174) |
| **Start DR** | `npm run dev:dr` | Starts Defect Reporting (Port 5175) |
| **Build All** | `npm run build` | Compiles all workspaces for deployment |
| **Clean Reset** | `Remove-Item -Path "node_modules" ...` | See "Troubleshooting" below |

## 🔄 Development Cycle
1.  **Check-out**: `git checkout -b track/feature-name`.
2.  **Sync**: `git pull origin main` (Resolve workspace conflicts immediately).
3.  **Dev**:
    * If working on **UI/Layout**, modify `packages/arteco-shared`.
    * If working on **Logic**, modify the specific App (`arteco-acm-frontend`, etc.).
4.  **Test**: Verify the feature works inside the **Portal Shell** (not just standalone).

### Code Standards (The "Vibe Check")
Before committing, verify:
* **No "Naked" Colors**: Are you using `#0D0060`? Refactor to `token.colorPrimary`.
* **No "Naked" Axios**: Are you importing `axios` directly? Refactor to import `api` from the configured source (`src/components/api` or shared).
* **Icons**: Are dashboard icons using the theme color? Are header icons white?

### The Refactor Loop (Addressing Technical Debt)
When updating legacy components:
1.  **Import Theme**: `import { theme } from 'antd';`
2.  **Get Token**: `const { token } = theme.useToken();`
3.  **Apply**: Replace `style={{ color: 'teal' }}` with `style={{ color: token.colorPrimary }}`.

## 🚑 Troubleshooting (The "Clean Sweep")
If dependencies desync (e.g., "React not found" or "Hoisting issues"):
1.  Delete `node_modules` in Root, Portal, and Shared.
2.  Delete `package-lock.json`.
3.  Run `npm install` in Root.

**API Issues (401 Unauthorized):**
* The app is likely ignoring your Auth Token. Check that the component imports the *Configured API Client* (with interceptors), not the raw `axios` library.