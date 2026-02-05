# Manifest: The Backend (FineArtApi)

**Context:** .NET 8 Web API + SQL Server (EF Core).
**Role:** The single source of truth for Data and Identity.

## 🔐 Identity & Authentication
The backend enforces strict JWT validation. It does not issue cookies; it expects the client to manage the token.

### Authentication Endpoints
* **Login**: `POST /api/auth/login`
    * *Requires*: `username`, `password`.
    * *Returns*: `{ token: "jwt_string", expiration: "..." }`.
* **Register**: `POST /api/auth/register`
    * *Requires*: `username`, `password`, `firstName`, `lastName`, `email`.
    * *Critical Constraint*: The API expects integer IDs for Roles and User Types. Since we do not currently fetch these dynamically, they are **hardcoded in the Frontend**.

### ⚠️ The "Hardcoded" Contract
The `LoginModal.jsx` (Frontend) and the Database Seed (Backend) are tightly coupled by these integer IDs. Changing them in the DB without updating the Frontend will break registration.

| Field | Value | Meaning |
| :--- | :--- | :--- |
| **roleId** | `2` | Standard User / Customer |
| **userTypeId** | `1` | Standard Account Type |
| **marketingConsent** | `true` | Defaulted |

## 📡 API Behavior
* **CORS**: The backend is configured to accept requests from the Azure Static Web App domains.
* **Swagger**: Available at `/swagger/index.html` (Production) for schema verification.