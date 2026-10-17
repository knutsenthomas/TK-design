## 2024-05-24 - [Fix] Add missing authentication to administrative endpoints
**Vulnerability:** Several administrative API endpoints (e.g., `/api/messages`, `/api/analytics`, `/api/debug-env`, and multiple GET/PUT/PATCH/DELETE endpoints under `/api/social-planner/*`) were missing the `verifyAdminToken` middleware, potentially exposing sensitive data or allowing unauthorized modifications.
**Learning:** Incomplete application of authentication middleware across all HTTP methods for secured route paths.
**Prevention:** Always verify that all methods (GET, POST, PUT, PATCH, DELETE) for administrative or sensitive endpoints implement required authentication middleware, rather than assuming it applies globally or only checking POST requests.
