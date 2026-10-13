
## 2024-05-24 - [CRITICAL] Host Header Injection in Admin Auth
**Vulnerability:** `verifyAdminToken` uses `req.hostname === 'localhost' || req.hostname === '127.0.0.1'` to allow local access without authentication. `req.hostname` is derived from the HTTP Host header, which is user-controlled.
**Learning:** Checking `req.hostname` for local development bypasses is a critical Host Header Injection vulnerability. An attacker can set the Host header to `localhost` in their request, bypassing authentication for sensitive admin endpoints.
**Prevention:** Always verify the actual network connection source using `req.ip` or `req.socket.remoteAddress` for IP-based authentication, and validate against trusted local IPs (e.g., `127.0.0.1`, `::1`). Never rely on user-controlled headers like `Host` or `X-Forwarded-Host` for security checks.
