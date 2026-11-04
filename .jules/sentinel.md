## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-11-04 - Firestore API SSRF and Path Traversal
**Vulnerability:** Constructing Firestore REST API URLs with unescaped user inputs (`req.params.id` for document IDs and object keys from `req.body` for query strings) allows Path Traversal and Server-Side Request Forgery (SSRF).
**Learning:** Variables embedded in file paths or query strings must be properly encoded to prevent injection of malicious path characters (`../`) or query parameters (e.g., `&`) that could lead to unauthorized database access.
**Prevention:** Always use `encodeURIComponent()` to sanitize variables interpolated into URLs for API calls or file paths.
