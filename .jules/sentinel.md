## 2024-10-26 - [Authorization Bypass on Admin Endpoints]
**Vulnerability:** Several admin endpoints (`/api/messages`, `/api/social-planner/*`, `/api/analytics`) were lacking the `verifyAdminToken` middleware, allowing unauthorized read, update, and delete access.
**Learning:** Middleware needs to be applied consistently across all routes of a feature, particularly RESTful endpoints (`GET`, `PATCH`, `PUT`, `DELETE`). Relying on clients not knowing the API paths is not sufficient security.
**Prevention:** Establish a robust routing structure where admin endpoints are grouped under an `/api/admin/` prefix and the middleware is applied at the router level, preventing accidental omissions on individual routes.
