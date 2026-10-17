## 2025-01-28 - Secure Administrative GET Endpoints
**Vulnerability:** Missing authentication on sensitive administrative GET endpoints (`/api/analytics`, `/api/messages`, `/api/social-planner`, etc.) in `legacy_html/server.js`.
**Learning:** Only POST requests were systematically protected by the `verifyAdminToken` middleware, leaving read-only (GET) administrative endpoints exposed. This pattern suggests an assumption that read operations are inherently safe or that only state-changing operations require authorization.
**Prevention:** Ensure *all* API endpoints exposing administrative data, configuration, or functionality implement the authentication middleware, regardless of the HTTP method used (GET vs POST).
