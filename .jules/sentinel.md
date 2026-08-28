## 2026-08-28 - [CRITICAL] Added authentication to /api/messages endpoint
**Vulnerability:** The GET, PATCH, and DELETE `/api/messages` endpoints in `legacy_html/server.js` were missing authentication, exposing contact data and allowing unauthorized modifications.
**Learning:** Some administrative endpoints lacked the standard `verifyAdminToken` middleware that was used elsewhere in the API.
**Prevention:** Ensure all new and existing administrative or sensitive API routes in Express use the `verifyAdminToken` middleware before the route handler.
