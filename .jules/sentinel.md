## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2026-11-06 - Path Traversal / SSRF in External API Calls
**Vulnerability:** Path traversal and SSRF vulnerability due to missing URL encoding in Google Firestore REST API calls.
**Learning:** Unsanitized variables such as `req.params.id` and `req.body` object keys were concatenated directly into the Firestore API URLs. This allowed attackers to inject path traversal sequences (e.g. `../`) to access unintended documents, or inject arbitrary query parameters.
**Prevention:** Always use `encodeURIComponent()` when inserting dynamic variables into URLs (especially in paths or query strings) to make sure they are treated as data, not structure.
