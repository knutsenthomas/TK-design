## 2024-05-24 - [CRITICAL] Missing Authentication on Admin API Endpoints
**Vulnerability:** Found endpoints (`/api/messages` GET, PATCH, DELETE) operating on sensitive user data without authentication checks.
**Learning:** In a mixed monolithic file containing both public and administrative endpoints, it is easy to accidentally omit authentication middleware (`verifyAdminToken`) on newly added or refactored administrative endpoints.
**Prevention:** Always verify that the `verifyAdminToken` middleware is explicitly attached to any route that accesses or modifies sensitive data (e.g., Firestore collections like `contactMessages`), rather than assuming global authentication or skipping it.
