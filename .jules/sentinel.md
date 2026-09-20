## 2026-09-20 - [Missing verifyAdminToken Middleware on Administrative Endpoints]
**Vulnerability:** Several sensitive administrative endpoints (e.g. `/api/analytics`, `/api/social-planner`, `/api/messages`) were missing the `verifyAdminToken` middleware, allowing unauthenticated and unauthorized access to read, modify, and delete sensitive data.
**Learning:** It is crucial to double-check that all administrative or sensitive backend API routes use the correct authentication middleware (`verifyAdminToken`).
**Prevention:** Perform regular security audits of all backend routing logic, using a linter rule or standard checking tools to ensure that endpoints designated for administrators consistently enforce authentication checks.
