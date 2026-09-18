## 2024-05-24 - [High] Add authentication to administrative endpoints
**Vulnerability:** Several administrative API endpoints in `legacy_html/server.js` (including `/api/analytics`, `/api/messages`, and `/api/social-planner` routes) were missing authentication checks.
**Learning:** These endpoints provide access to sensitive data (analytics, user messages) and allow for modification of social planner data without any verification of user identity.
**Prevention:** All endpoints that expose sensitive data or perform administrative actions must be protected by the `verifyAdminToken` middleware or similar authentication checks. Always verify authorization logic for all endpoints, especially those dealing with analytics, user data, or system configuration.
