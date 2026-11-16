## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-11-04 - SSRF and Path Traversal in Firestore API requests
**Vulnerability:** The `/api/messages/:id` routes (PATCH and DELETE) used `req.params.id` directly in the Firestore API URL without URL encoding (`.../documents/${collection}/${id}`).
**Learning:** This exposes the application to Path Traversal and Server-Side Request Forgery (SSRF) vulnerabilities, as an attacker could supply an `id` containing path traversal characters (`../`) or query string delimiters (`?`) to manipulate the targeted Firestore resource or behavior.
**Prevention:** Always use `encodeURIComponent()` to sanitize user input (like URL parameters or body fields) before embedding them into outgoing API requests or file paths.
