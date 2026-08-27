## 2024-05-24 - [Missing Authentication on API endpoints]
**Vulnerability:** Found unauthenticated endpoints (`GET /api/messages`, `PATCH /api/messages/:id`, `DELETE /api/messages/:id`) in `legacy_html/server.js` that modify/fetch sensitive admin data.
**Learning:** Any endpoint fetching or modifying sensitive admin data in `legacy_html/server.js` must be protected with the `verifyAdminToken` middleware unless explicitly intended for public access.
**Prevention:** Always add `verifyAdminToken` middleware when creating new admin API endpoints.