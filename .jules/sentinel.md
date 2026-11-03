## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-10-31 - Path Traversal / SSRF in Firestore API URLs
**Vulnerability:** User inputs (e.g. `req.params.id`, `req.body` keys) are used to construct URLs for Firestore API calls without sanitization. This allows Path Traversal and SSRF vulnerabilities.
**Learning:** Constructing API URLs with unvalidated/unsanitized user input allows an attacker to break out of the intended API path to access or modify unauthorized documents.
**Prevention:** Always use `encodeURIComponent()` to sanitize user inputs when constructing URLs for external API calls.
