## 2024-10-31 - Trust proxy security
**Vulnerability:** The application does not use `app.set('trust proxy', 1)` correctly (or it was removed), and manually extracts `req.headers["x-forwarded-for"]` for rate limiting and IP logging.
**Learning:** Manually parsing `x-forwarded-for` header opens up for IP spoofing because anyone can send a fake `x-forwarded-for` header, bypassing rate limiting. Express's `trust proxy` setting securely extracts the real IP when placed behind a proxy/load balancer, protecting against IP spoofing.
**Prevention:** Use `app.set('trust proxy', 1)` when behind a reverse proxy and rely on `req.ip` instead of manually reading `x-forwarded-for`.

## 2024-11-01 - Firestore Path Traversal and SSRF vulnerabilities
**Vulnerability:** Constructing Firestore API URLs using unsanitized user inputs or object keys from requests opens up path traversal and Server-Side Request Forgery (SSRF) vulnerabilities. In `legacy_html/server.js`, variables like `req.params.id`, `collection`, `databaseId`, and object keys used for `updateMask` were not URL encoded before being embedded in fetch requests.
**Learning:** Embedding unsanitized inputs into external or database API URLs allows attackers to manipulate the intended path or inject query parameters. An attacker could potentially bypass authorization to access, modify, or delete unintended documents by including characters like `../` or additional query strings in the input.
**Prevention:** Always use `encodeURIComponent()` to sanitize user-provided variables, object keys, and parameters before concatenating them into API URLs.
