## 2026-09-14 - [CRITICAL] Missing Authentication on Admin Endpoints
**Vulnerability:** Several administrative API endpoints (e.g. `/api/analytics`, `/api/messages`, and various `/api/social-planner` routes) in `legacy_html/server.js` were missing the `verifyAdminToken` middleware.
**Learning:** These endpoints were previously accessible to unauthenticated users, which could lead to unauthorized data access or modification. It's crucial to ensure all admin-related routes have the correct authorization middleware applied.
**Prevention:** Always verify that all admin routes use `verifyAdminToken`. Consider grouping admin routes under a single router where middleware is applied to the entire group to avoid missing it on individual endpoints.
