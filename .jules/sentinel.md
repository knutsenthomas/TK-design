## 2024-05-24 - [Fix missing authentication on messages endpoint]
**Vulnerability:** The `/api/messages` endpoints (GET, PATCH, DELETE) in `legacy_html/server.js` lacked authentication middleware, exposing sensitive user messages to unauthorized access.
**Learning:** Admin endpoints must explicitly include authentication middleware (like `verifyAdminToken`) to ensure data protection and access control.
**Prevention:** Always verify that routes handling sensitive data or admin functions have appropriate authentication and authorization middleware applied.
