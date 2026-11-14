## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-11-09 - Firestore API Encoding
**Vulnerability:** Constructing Firestore REST API URLs manually using unsanitized user input (like object keys in updateMask or parameters in the URL path)
**Learning:** When generating dynamic query string components or URL path segments from user input (e.g. `req.body` keys for `updateMask.fieldPaths` or `req.params.id`), failure to URL-encode the values can lead to path traversal, parameter injection or Server-Side Request Forgery (SSRF). An attacker could manipulate the `id` or update keys to modify or access unintended resources or alter the request structure.
**Prevention:** Always use `encodeURIComponent()` when embedding user input into URLs, particularly for database identifiers and dynamic query string parameters.
