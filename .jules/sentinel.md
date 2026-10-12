## 2026-08-30 - Fix Missing Authentication on Sensitive Endpoints
**Vulnerability:** The `/api/messages` API endpoints (GET, PATCH, DELETE) for retrieving, modifying, and deleting contact messages were missing the `verifyAdminToken` middleware, allowing unauthorized access.
**Learning:** Although authentication middleware is defined, it must be explicitly added to every sensitive API route to ensure complete coverage. Missing it on CRUD routes for user data is a critical privacy leak.
**Prevention:** Ensure a systematic review of all API endpoints handling sensitive data (like contact forms, messages, or admin settings) explicitly requires authentication middleware like `verifyAdminToken`.
