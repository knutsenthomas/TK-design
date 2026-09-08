## 2024-05-18 - Missing Authentication on Sensitive Endpoints
**Vulnerability:** Found multiple sensitive endpoints (`/api/analytics`, `/api/messages` GET/PATCH/DELETE) exposing data without any authentication check.
**Learning:** Endpoints that do not natively modify content (like GET routes for PII or analytics) were missed when `verifyAdminToken` was applied to POST/content endpoints.
**Prevention:** Always apply the `verifyAdminToken` middleware or an equivalent authentication check to any endpoint that exposes sensitive data or performs privileged operations, regardless of the HTTP method (GET, POST, PATCH, DELETE).
