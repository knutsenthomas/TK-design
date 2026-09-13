## 2026-09-13 - Missing Authentication on Admin Endpoints
**Vulnerability:** Several administrative API endpoints (`/api/analytics`, `/api/messages`, and various `/api/social-planner` endpoints) were missing authentication, allowing unauthenticated access to sensitive administrative functionality and data.
**Learning:** Administrative endpoints were added sequentially without universally applying the `verifyAdminToken` middleware, leading to authorization bypass vulnerabilities.
**Prevention:** Ensure all new and existing administrative routes strictly enforce the `verifyAdminToken` middleware. Centralize route authentication instead of applying it individually per endpoint where possible.
